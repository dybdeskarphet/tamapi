import express, { Request, Response } from "express";
import { err } from "../helpers";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../db";
import { IUser, User } from "../models/User";

dotenv.config();
connectDatabase(path.basename(__filename));
const VERBOSE_LOG = true;

const authController = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json({
      message: "Calling root does nothing in auth route.",
    });
  } catch (error) {
    VERBOSE_LOG && err("routes(auth)", `Error while 'GET /':\n${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { authController };
