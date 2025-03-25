import { User } from "../models/User";
import { IPet, Pet } from "../models/Pet";
import { ServiceError } from "../errors/ServiceError";
import { err } from "../helpers";
import mongoose from "mongoose";
import { InvalidatedProjectKind } from "typescript";
import { PetHistory } from "../models/PetHistory";

const getPetsWithUser = async (userId: string | undefined) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(401, "Invalid user format.");
  }

  const user = await User.findById(userId)
    .select("-password")
    .populate("pets")
    .exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  if (user.pets.length === 0) {
    throw new ServiceError(404, "No pets found.");
  }

  return user.pets;
};

const getPetById = async (petId: string | undefined) => {
  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format");
  }

  const pet = await Pet.findById(petId).exec();

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  return pet;
};

const createPet = async (
  userId: string | undefined,
  name: string,
  type: string,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(401, "Invalid user format.");
  }

  const user = await User.findById(userId).select("-password").exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  if (!name || !type) {
    throw new ServiceError(400, "Name and type is required.");
  }

  const pet = new Pet({ name, type, owner: userId });
  await pet.save();

  user.pets.push(pet._id as mongoose.Types.ObjectId);
  await user.save();

  return pet;
};

type statusKeys = keyof Pick<
  IPet,
  "health" | "happiness" | "hunger" | "energy" | "hygiene"
>;

// NOTE: Use this function only for the fields that have 0-100 min-max values.
// This is the most amazing thing i've ever written in my entire life (as of March 2025)
const updatePetStatus = async (
  userId: string | undefined,
  petId: string | undefined,
  actionName: string,
  fields: Partial<Record<statusKeys, number>>,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format.");
  }

  const user = await User.findById(userId).select("-password").exec();
  const pet = await Pet.findById(petId).populate("owner").exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  let invalidFields = Object.entries(fields)
    .filter(([field]) => {
      return !(field in pet) || typeof pet[field as keyof IPet] === "string";
    })
    .map(([field]) => field);

  if (invalidFields.length !== 0) {
    throw new ServiceError(
      400,
      `You cannot update these fields: ${invalidFields}`,
    );
  }

  let lowFields: string[] = Object.entries(fields)
    .filter(([field, value]) => pet[field as keyof IPet] + value < 0)
    .map(([key]) => key);

  if (lowFields.length !== 0) {
    throw new ServiceError(
      401,
      `Some fields are too low to perform this action: ${lowFields}`,
    );
  }

  let simplifedPet = {
    _id: pet._id,
    name: pet.name,
  } as Record<statusKeys, number> & { _id: unknown; name: string };

  Object.entries(fields).forEach(([field, value]) => {
    pet[field as statusKeys] = Math.min(100, pet[field as statusKeys] + value);
    simplifedPet[field as statusKeys] = pet[field as statusKeys];
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

export { getPetsWithUser, getPetById, createPet, updatePetStatus };
