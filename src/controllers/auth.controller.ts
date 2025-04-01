import { Request, Response } from "express";
import { err } from "../helpers";
import dotenv from "dotenv";
import {
  postAuthRegisterService,
  postAuthLoginService,
} from "../services/auth.service";
import { ServiceError } from "../errors/service.error";

dotenv.config();
const VERBOSE_LOG = true;
const IDENTIFIER = "AuthController";

const postAuthRegisterController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, name, username, password } = req.body;
    const user = await postAuthRegisterService(email, name, username, password);
    res.status(201).json({ message: "User registered successfully", user });
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

const postAuthLoginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await postAuthLoginService(email, password);
    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error." });
    }
    return;
  }
};

export { postAuthRegisterController, postAuthLoginController };
