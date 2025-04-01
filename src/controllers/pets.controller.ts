import dotenv from "dotenv";
import { Request, Response } from "express";
import {
  checkOwnershipService,
  createPetService,
  deletePetService,
  getPetService,
  updateModifiableFieldsService,
  updatePetStatusService,
} from "../services/pets.service";
import { ServiceError } from "../errors/service.error";
import { PetTypes } from "../types/pet.types";
import { checkUserExistence, getUser } from "../utils/user.utils";
import { UserTypes } from "../types/user.types";

dotenv.config();
const IDENTIFIER = "pets.controller";

const getPetsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = (await getUser({ _id: req.userId }, false)) as UserTypes.IUser;

    res.status(200).json({
      message: "Pets listed successfully.",
      data: { pets: user.pets },
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

const getPetController = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await getPetService(req.params.id);

    res
      .status(200)
      .json({ message: "Pet stats listed successfully.", data: { pet } });
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
    res.status(201).json({ message: "Pet created.", data: { pet } });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

const postPetActionController = async (
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

    res.status(200).json({
      message: `Action taken: ${action}.`,
      data: { pet: updateStatus.pet },
    });
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
    const pet = await getPetService(req.params.id, ["history"]);
    await checkUserExistence({ _id: req.userId }, false);
    await checkOwnershipService(req.userId, pet.owner._id);

    res.status(200).json({
      message: "Pet history is listed.",
      data: {
        pet: {
          _id: pet._id,
          name: pet.name,
          history: pet.history,
        },
      },
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
      message: "Pet deleted successfully",
      data: {
        pet,
      },
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

const patchPetController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const pet = await updateModifiableFieldsService(
      req.userId,
      req.params.id,
      req.body,
    );
    res.status(200).json({ messsage: `Pet updated.`, data: { pet } });
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
  postPetActionController,
  getPetHistoryController,
  deletePetController,
  patchPetController,
};
