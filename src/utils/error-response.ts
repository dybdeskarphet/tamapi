import { Response } from "express";
import { ServiceError } from "../errors/service.error";
import { err } from "../helpers";
import dotenv from "dotenv";

const handleControllerError = (
  res: Response,
  error: unknown,
  verbose: boolean = false,
) => {
  if (error instanceof ServiceError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : []),
    });
  } else {
    (verbose || process.env.VERBOSE_LOG === "true") && console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { handleControllerError };
