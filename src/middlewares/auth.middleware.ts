import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { err } from "../helpers";
import dotenv from "dotenv";

dotenv.config();

const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    // All the error handling
    if (!authHeader) {
      res.status(401).json({
        message: "Access denied. No 'Authorization' header provided.",
      });
      return;
    }

    const tokenArr = authHeader.split(" ");

    if (!tokenArr || tokenArr.length < 2) {
      res.status(401).json({ message: "Access denied. Invalid token format." });
      return;
    }

    if (tokenArr[0] !== "Bearer") {
      res.status(401).json({ message: "Access denied. Wrong token scheme." });
      return;
    }

    if (!process.env.JWT_SECRET) {
      err("authMiddleware", "JWT_SECRET is missing in .env");
      res.status(500).json({ message: "Internal server error." });
      return;
    }

    // Actual verification part is here
    const decoded = jwt.verify(
      tokenArr[1],
      process.env.JWT_SECRET as string,
    ) as JwtPayload;

    // Attach userId to the request
    req.userId = decoded.userId as string;
    next();
  } catch (error) {
    err("authMiddleware", `Error while verifying token: ${error}`);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { authMiddleware };
