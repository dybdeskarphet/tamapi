import { Pet } from "../models/pet.model";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { err, log } from "../helpers";
import {
  checkOwnershipService,
  checkUserService,
  createPetService,
  deletePetService,
  getPetService,
  getUserService,
  updatePetStatusService,
} from "../services/pets.service";
import { ServiceError } from "../errors/service.error";
import { PetTypes } from "../types/pet.types";

dotenv.config();
const VERBOSE_LOG = true;
const IDENTIFIER = "PetsController";

const getPetsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await getUserService(req.userId, false);

    res
      .status(200)
      .json({ pets: user.pets, message: "Pets listed successfully." });
    return;
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const getPetController = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await getPetService(req.params.id);

    res
      .status(200)
      .json({ pet: pet, message: "Pet stats listed successfully." });
    return;
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const postPetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pet = await createPetService(
      req.userId,
      req.body.name,
      req.body.type,
    );
    res.status(201).json({ pet, message: "Pet created." });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const postPetStatusController = async (
  req: Request,
  res: Response,
  action: string,
  fields: Partial<Record<PetTypes.statusKeys, number>>,
): Promise<void> => {
  try {
    const updateStatus = await updatePetStatusService(
      req.userId,
      req.params.id,
      action,
      fields,
    );

    res
      .status(200)
      .json({ pet: updateStatus.pet, message: `Action taken: ${action}.` });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const getPetHistoryController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pet = await getPetService(req.params.id);
    await checkUserService(req.userId);
    await checkOwnershipService(req.userId, pet.owner._id);

    res.status(200).json({
      pet: {
        _id: pet._id,
        name: pet.name,
        history: pet.history,
      },
      message: "Pet history is listed.",
    });
    return;
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const deletePetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pet = deletePetService(req.userId, req.params.id);
    res.status(200).json({
      pet,
      message: "Pet deleted successfully",
    });
    return;
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

export {
  getPetsController,
  getPetController,
  postPetController,
  postPetStatusController,
  getPetHistoryController,
  deletePetController,
};
