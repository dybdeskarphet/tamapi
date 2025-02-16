import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { err } from "../helpers";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    // All the error handling
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No 'Authorization' header provided.",
      });
    }

    const tokenArr = authHeader.split(" ");

    if (!tokenArr || tokenArr.length < 2) {
      return res
        .status(401)
        .json({ message: "Access denied. Invalid token format." });
    }

    if (tokenArr[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Access denied. Wrong token scheme." });
    }

    if (!process.env.JWT_SECRET) {
      err("authMiddleware", "JWT_SECRET is missing in .env");
      return res.status(500).json({ message: "Internal server error." });
    }

    // Actual verification part is here
    const decoded = jwt.verify(
      tokenArr[1],
      process.env.JWT_SECRET,
    ) as JwtPayload;

    // Attach userId to the request
    // WARN: check if Request type is extended for userId
    req.userId = decoded.userId;
    next();
  } catch (error) {
    err("authMiddleware", `Error while verifying token: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};
