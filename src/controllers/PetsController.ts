import { IPet, Pet } from "../models/Pet";
import { User } from "../models/User";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import path from "path";
import { err } from "../helpers";
import mongoose from "mongoose";

dotenv.config();
const VERBOSE_LOG = true;
const IDENTIFIER = "PetsController";

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

export { getPets, getPet, postPet };
