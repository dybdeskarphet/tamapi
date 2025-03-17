import { IPet, Pet } from "../models/Pet";
import { User } from "../models/User";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "path";
import { err, log } from "../helpers";
import mongoose from "mongoose";
import { PetHistory } from "../models/PetHistory";

dotenv.config();
const VERBOSE_LOG = true;
const IDENTIFIER = "PetsController";

// TODO: Put this checker to a proper place, it shouldn't be inside controller. Maybe find a better way to handle low fields?
const lowFieldChecker = (pet: IPet, fields: (keyof IPet)[]) => {
  let checkFields: string[] = [];
  for (let field of fields) {
    if (typeof pet[field] === "number" && pet[field] <= 0) {
      checkFields.push(field.toString());
    }
  }

  if (checkFields.length !== 0) {
    return {
      isLow: true,
      message: "Pet stats are too low",
      lowStats: checkFields,
      statusCode: 409,
    };
  } else {
    return {
      isLow: false,
      message: "Pet stats are normal.",
      lowStats: undefined,
      statusCode: 200,
    };
  }
};

const getPets = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)
      .select("-password")
      .populate("pets")
      .exec();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.pets.length === 0) {
      res.status(404).json({ message: "No pets found" });
      return;
    }

    res
      .status(200)
      .json({ pets: user.pets, message: "Pets listed successfully" });
    return;
  } catch (error) {
    VERBOSE_LOG && err(IDENTIFIER, `Error while verifying token: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

const getPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const pet = await Pet.findById(req.params.id);

    if (!pet) {
      res.status(404).json({ message: "No pet at given ID" });
      return;
    }

    res
      .status(200)
      .json({ pet: pet, message: "Pet stats listed successfully." });
    return;
  } catch (error) {
    VERBOSE_LOG && err(IDENTIFIER, `Error while getting pet by ID: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

const postPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const { name, type } = req.body;

    if (!name || !type) {
      res.status(400).json({ message: "Name and type is required." });
    }

    const pet = new Pet({ name, type, owner: user._id });
    await pet.save();

    user.pets.push(pet._id as mongoose.Types.ObjectId);
    await user.save();

    res.status(201).json({ pet, message: "Pet created." });
  } catch (error) {
    VERBOSE_LOG && err(IDENTIFIER, `Error while creating pet: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

const feedPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    const pet = await Pet.findById(req.params.id).populate("owner").exec();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!pet) {
      res.status(404).json({ message: "No pet at given ID" });
      return;
    }

    if (pet.owner._id.toString() == req.userId) {
      let checker = lowFieldChecker(pet, ["hygiene", "energy"]);

      if (checker.isLow) {
        res
          .status(checker.statusCode)
          .json({ fields: checker.lowStats, message: checker.message });
        return;
      }

      // TODO: Now that you learned how to handle max values, find how to get the current max value of the relevant field
      // TODO: Do the same for age in the future?
      const petFed = await Pet.findByIdAndUpdate(
        pet._id,
        [
          {
            $set: {
              hunger: { $min: [{ $add: ["$hunger", 10] }, 100] },
              energy: { $subtract: ["$energy", 5] },
              hygiene: { $subtract: ["$hygiene", 5] },
            },
          },
        ],
        { new: true },
      );

      // Add to history
      const history = new PetHistory({ action: "feed", linkedTo: pet._id });
      await history.save();

      pet.history.push(history._id as mongoose.Types.ObjectId);
      await pet.save();

      res.status(200).json({ pet: petFed, message: `Pet is fed.` });
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
    VERBOSE_LOG && err(IDENTIFIER, `Error while feeding pet: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

const sleepPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-password");
    const pet = await Pet.findById(req.params.id).populate("owner").exec();

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!pet) {
      res.status(404).json({ message: "No pet at given ID" });
      return;
    }

    if (pet.owner._id.toString() == req.userId) {
      let checker = lowFieldChecker(pet, ["hunger"]);

      if (checker.isLow) {
        res
          .status(checker.statusCode)
          .json({ fields: checker.lowStats, message: checker.message });
        return;
      }

      const petSleep = await Pet.findByIdAndUpdate(
        pet._id,
        {
          $inc: { hunger: -5 },
          $set: {
            energy: 100,
          },
        },
        { new: true },
      );

      // Add to history
      const history = new PetHistory({ action: "sleep", linkedTo: pet._id });
      await history.save();

      pet.history.push(history._id as mongoose.Types.ObjectId);
      await pet.save();

      res.status(200).json({ pet: petSleep, message: `Pet is slept.` });
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
    VERBOSE_LOG && err(IDENTIFIER, `Error while sleeping pet: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getPets, getPet, postPet, feedPet, sleepPet };
