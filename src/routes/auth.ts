import express, { Request, Response } from "express";
import { IUser, User } from "../models/User";
import path from "path";
import { connectDatabase } from "../db";
import dotenv from "dotenv";
import { err } from "../helpers";

const router = express.Router();
dotenv.config();
connectDatabase(path.basename(__filename));
const VERBOSE_LOG = true;

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json({
      message: "Calling root does nothing in auth route.",
    });
  } catch (error) {
    VERBOSE_LOG && err("routes(auth)", `Error while 'GET /':\n${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
});

export { router as authRoute };
