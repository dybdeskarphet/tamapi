import { Pet } from "../models/pet.model";
import { User } from "../models/user.model";
import dotenv from "dotenv";
import { Request, Response } from "express";
import { err, log } from "../helpers";
import {
  createPetService,
  getPetHistoryService,
  getPetService,
  listPetsService,
  updatePetStatusService,
} from "../services/pets.service";
import { ServiceError } from "../errors/service.error";

dotenv.config();
const VERBOSE_LOG = true;
const IDENTIFIER = "PetsController";

// TODO: Put this checker to a proper place, it shouldn't be inside controller. Maybe find a better way to handle low fields?

const getPetsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pets = await listPetsService(req.userId);
    res.status(200).json({ pets, message: "Pets listed successfully." });
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

const feedPetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updateStatus = await updatePetStatusService(
      req.userId,
      req.params.id,
      "feed",
      {
        hunger: 10,
        energy: -4,
        hygiene: -6,
      },
    );

    res.status(200).json({ pet: updateStatus.pet, message: `Pet is fed.` });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const sleepPetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const updateStatus = await updatePetStatusService(
      req.userId,
      req.params.id,
      "sleep",
      {
        energy: 10,
        hygiene: -4,
        hunger: -8,
      },
    );

    res.status(200).json({ pet: updateStatus.pet, message: `Pet is slept.` });
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
    const getHistoryStatus = await getPetHistoryService(
      req.userId,
      req.params.id,
    );

    res
      .status(200)
      .json({ pet: getHistoryStatus, message: "Pet history is listed." });
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
    const user = await User.findById(req.userId).select("-password").exec();

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const pet = await Pet.findById(req.params.id).exec();

    if (!pet) {
      res.status(404).json({ message: "Pet not found." });
      return;
    }

    if (pet.owner._id.toString() == req.userId) {
      await Pet.deleteOne({ _id: req.params.id });
      res.status(200).json({
        pet,
        message: "Pet deleted successfully",
      });
      return;
    } else {
      res
        .status(403)
        .json({ message: "Pet owner ID doesn't match with user ID." });
      VERBOSE_LOG &&
        log(
          IDENTIFIER,
          `Pet owner ID doesn't match with user ID:\npet.owner._id: ${pet.owner._id}\nuser._id: ${user._id}`,
        );
      return;
    }
  } catch (error) {
    VERBOSE_LOG && err(IDENTIFIER, `Error deleting the pet: ${error}`);
    res.status(500).json({ message: "Internal server error." });
    return;
  }
};

export {
  getPetsController,
  getPetController,
  postPetController,
  feedPetController,
  getPetHistoryController,
  deletePetController,
  sleepPetController,
};
