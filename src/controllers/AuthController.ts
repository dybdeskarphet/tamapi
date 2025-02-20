import express, { Request, Response } from "express";
import { err, log } from "../helpers";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../db";
import { IUser, User } from "../models/User";
import jwt from "jsonwebtoken";

dotenv.config();
connectDatabase(path.basename(__filename));
const VERBOSE_LOG = true;

const getAuthRoot = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(201).json({
      message: "Calling root does nothing in auth route.",
    });
  } catch (error) {
    VERBOSE_LOG && err("routes(auth)", `Error while 'GET /':\n${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

const postAuthRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name, username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
    }

    const user = new User({ email, name, username, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
    return;
  } catch (error) {
    VERBOSE_LOG &&
      err("AuthController", `Couldn't register the user: ${error}`);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

const postAuthLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    // NOTE: Because you set "select: false" in password field,
    // you have to select password explicitly for it to work.
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      },
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    VERBOSE_LOG && err("AuthController", `Couldn't log in as a user: ${error}`);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
};

export { getAuthRoot, postAuthRegister, postAuthLogin };
