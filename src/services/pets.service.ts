import { User } from "../models/user.model";
import { Pet } from "../models/pet.model";
import { ServiceError } from "../errors/service.error";
import mongoose from "mongoose";
import { PetHistory } from "../models/pet-history.model";
import { PetTypes } from "../types/pet.types";
import { err } from "../helpers";

const listPetsService = async (userId: string | undefined) => {
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

const getPetService = async (petId: string | undefined) => {
  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format");
  }

  const pet = await Pet.findById(petId).exec();

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  return pet;
};

const createPetService = async (
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

// NOTE: Use this function only for the fields that have 0-100 min-max values.
// This is the most amazing thing i've ever written in my entire life (as of March 2025)
const updatePetStatusService = async (
  userId: string | undefined,
  petId: string | undefined,
  actionName: string,
  fields: Partial<Record<PetTypes.statusKeys, number>>,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format.");
  }

  const user = await User.findById(userId).select("-password").exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  const pet = await Pet.findById(petId).populate("owner").exec();

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  if (pet.owner._id.toString() !== userId) {
    throw new ServiceError(
      401,
      "You're not allowed to perform actions on this pet.",
    );
  }

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

const getPetHistoryService = async (
  userId: string | undefined,
  petId: string | undefined,
) => {
  if (!userId || typeof userId !== "string") {
    throw new ServiceError(400, "Invalid user format.");
  }

  if (!petId || !mongoose.Types.ObjectId.isValid(petId)) {
    throw new ServiceError(400, "Invalid Pet ID format.");
  }

  const user = await User.findById(userId).select("-password").exec();

  if (!user) {
    throw new ServiceError(404, "User not found.");
  }

  const pet = await Pet.findById(petId)
    .populate("owner")
    .populate("history")
    .exec();

  if (!pet) {
    throw new ServiceError(404, "No pet at given ID");
  }

  if (pet.owner._id.toString() !== userId) {
    throw new ServiceError(
      401,
      "You're not allowed to perform actions on this pet.",
    );
  }

  return {
    _id: pet._id,
    name: pet.name,
    history: pet.history,
  };
};

export {
  listPetsService,
  getPetService,
  createPetService,
  updatePetStatusService,
  getPetHistoryService,
};
