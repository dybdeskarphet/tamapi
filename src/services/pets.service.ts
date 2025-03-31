import { User } from "../models/user.model";
import { Pet } from "../models/pet.model";
import { ServiceError } from "../errors/service.error";
import mongoose, { ObjectId } from "mongoose";
import { PetHistory } from "../models/pet-history.model";
import { PetTypes } from "../types/pet.types";
import { checkUserExistence, getUser } from "../utils/user.utils";

const getPetService = async (
  petId: string | undefined,
  populatePet: string[] = ["owner"],
) => {
  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format.");
  }

  const pet = await Pet.findById(petId).populate(populatePet.join(" ")).exec();

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  return pet;
};

const checkOwnershipService = async (
  userId: string | undefined,
  petOwnerId: mongoose.Types.ObjectId | undefined,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  if (!petOwnerId) {
    throw new ServiceError(400, "Invalid pet owner ID format.");
  }

  if (petOwnerId.toString() !== userId) {
    throw new ServiceError(
      401,
      "You're not allowed to perform actions on this pet.",
    );
  }
};

const createPetService = async (
  userId: string | undefined,
  name: string,
  type: string,
) => {
  const user = await getUser({ _id: userId }, false);

  if (!name || !type) {
    throw new ServiceError(400, "Name and type is required.");
  }

  const pet = new Pet({ name, type, owner: userId });
  await pet.save();

  user.pets.push(pet._id as mongoose.Types.ObjectId);
  await user.save();

  return pet;
};

// NOTE: Use this function only for the fields that have 0-100 min-max values.
// This is the most amazing thing i've ever written in my entire life (as of March 2025)
const updatePetStatusService = async (
  userId: string | undefined,
  petId: string | undefined,
  actionName: string,
  fields: Partial<Record<PetTypes.statusKeys, number>>,
) => {
  const pet = await getPetService(petId);
  await checkUserExistence({ _id: userId });
  await checkOwnershipService(userId, pet.owner._id);

  // Promise all used here to convert the array to a single Promise
  // If it is not given, service will continue without checking all the fields.
  let fieldChecks = await Promise.all(
    Object.entries(fields).map(async ([field]) => {
      return (await pet.isGivenCategory("status", field)) ? null : field;
    }),
  );

  let invalidFields = fieldChecks.filter((field) => field !== null);

  if (invalidFields.length !== 0) {
    throw new ServiceError(
      400,
      `You cannot update these fields: ${invalidFields}`,
    );
  }

  let lowFields: string[] = Object.entries(fields)
    .filter(([field, value]) => pet[field as PetTypes.statusKeys] + value < 0)
    .map(([key]) => key);

  if (lowFields.length !== 0) {
    throw new ServiceError(
      401,
      `Some fields are too low to perform this action: ${lowFields.join(", ")}`,
    );
  }

  let simplifedPet = {
    _id: pet._id,
    name: pet.name,
  } as Record<PetTypes.statusKeys, number> & { _id: unknown; name: string };

  Object.entries(fields).forEach(([field, value]) => {
    const currentField = field as PetTypes.statusKeys;
    console.log(pet.isGivenCategory("status", field));
    pet[currentField] = Math.min(100, pet[currentField] + value);
    simplifedPet[currentField] = pet[currentField];
  });

  const history = new PetHistory({ action: actionName, linkedTo: pet._id });
  await history.save();

  pet.history.push(history._id as mongoose.Types.ObjectId);
  await pet.save();
  return {
    pet: simplifedPet,
    action: actionName,
  };
};

const deletePetService = async (
  userId: string | undefined,
  petId: string | undefined,
) => {
  const pet = await getPetService(petId);
  await checkUserExistence({ _id: userId });
  await checkOwnershipService(userId, pet.owner._id);

  await Pet.deleteOne({ _id: petId });
  await User.findByIdAndUpdate(userId, {
    $pull: { pets: petId },
  });

  return { pet };
};

const updateModifiableFieldsService = async (
  userId: string | undefined,
  petId: string | undefined,
  fields: Partial<Record<PetTypes.patchableKeys, unknown>>,
) => {
  const pet = await getPetService(petId);
  await checkUserExistence({ _id: userId });
  await checkOwnershipService(userId, pet.owner._id);

  let fieldChecks = await Promise.all(
    Object.entries(fields).map(async ([field]) => {
      return (await pet.isGivenCategory("patchable", field)) ? null : field;
    }),
  );

  let invalidFields = fieldChecks.filter((field) => field !== null);

  const valueChecks = await Promise.all(
    Object.entries(fields).map(async ([field, value]) => {
      return (await pet.isValidFieldType(value, field))
        ? null
        : { field: value };
    }),
  );

  let invalidValues = valueChecks.filter((value) => value !== null);

  if (invalidFields.length !== 0) {
    throw new ServiceError(
      400,
      `You cannot update these fields: ${invalidFields}`,
    );
  }

  if (invalidValues.length !== 0) {
    throw new ServiceError(
      400,
      `You cannot update fields with invalid values: ${invalidValues}`,
    );
  }

  let simplifedPet = {} as Record<PetTypes.patchableKeys, string>;

  Object.entries(fields).forEach(([field, value]) => {
    const currentField = field as PetTypes.patchableKeys;
    if (typeof value === "string") {
      pet[currentField] = value;
      simplifedPet[currentField] = pet[currentField];
    }
  });

  await pet.save();
  return simplifedPet;
};

export {
  getPetService,
  createPetService,
  updatePetStatusService,
  checkOwnershipService,
  deletePetService,
  updateModifiableFieldsService,
};
