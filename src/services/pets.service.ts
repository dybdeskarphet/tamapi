import { User } from "../models/user.model";
import { Pet } from "../models/pet.model";
import { ServiceError } from "../errors/service.error";
import mongoose, { ObjectId } from "mongoose";
import { PetHistory } from "../models/pet-history.model";
import { PetTypes } from "../types/pet.types";
import { log } from "../helpers";

const getUserService = async (
  userId: string | undefined,
  password: boolean,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  let passwordString = password ? "+password" : "-password";

  const user = await User.findById(userId).select(passwordString).exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  return user;
};

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

const checkUserService = async (userId: string | undefined) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  const user = await User.findById(userId).exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }
};

const checkInvalidFieldsService = async (
  pet: PetTypes.IPet,
  fields:
    | Partial<Record<PetTypes.statusKeys, number>>
    | Partial<Record<PetTypes.modifiableKeys, string>>,
) => {
  let invalidFields = Object.entries(fields)
    .filter(([field]) => {
      return !(field in pet);
    })
    .map(([field]) => field);

  if (invalidFields.length !== 0) {
    throw new ServiceError(
      400,
      `You cannot update these fields: ${invalidFields}`,
    );
  }
};

const createPetService = async (
  userId: string | undefined,
  name: string,
  type: string,
) => {
  const user = await getUserService(userId, false);

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
  await checkUserService(userId);
  await checkOwnershipService(userId, pet.owner._id);
  await checkInvalidFieldsService(pet, fields);

  let invalidFields = Object.entries(fields)
    .filter(([field]) => {
      return (
        !(field in pet) || typeof pet[field as keyof PetTypes.IPet] === "string"
      );
    })
    .map(([field]) => field);

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
  await checkUserService(userId);
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
  fields: Partial<Record<PetTypes.modifiableKeys, unknown>>,
) => {
  const pet = await getPetService(petId);
  await checkUserService(userId);
  await checkOwnershipService(userId, pet.owner._id);

  const validFields = ["name"];

  const invalidFields = Object.entries(fields).filter(
    ([field, value]) => !validFields.includes(field as PetTypes.modifiableKeys),
  );

  // TODO: I know, this is very hacky and only applies for the "name" field, but we have to check req.body values somehow. Fix it when you want to.
  // Probably needs a better (and more complex) type checking.
  const invalidValues = Object.values(fields).filter(
    (value) => typeof value !== "string",
  );

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

  let simplifedPet = {} as Record<PetTypes.modifiableKeys, string>;

  Object.entries(fields).forEach(([field, value]) => {
    const currentField = field as PetTypes.modifiableKeys;
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
  getUserService,
  checkUserService,
  updateModifiableFieldsService,
};
