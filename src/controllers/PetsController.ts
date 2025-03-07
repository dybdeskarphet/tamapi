import { Pet } from "../models/Pet";
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
      .json({ pets: user.pets, message: "Pet's listed successfully" });
    return;
  } catch (error) {
    VERBOSE_LOG && err(IDENTIFIER, `Error while verifying token: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { getPets };
