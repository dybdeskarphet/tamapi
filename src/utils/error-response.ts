import { Response } from "express";
import { ServiceError } from "../errors/service.error";
import { err } from "../helpers";

const handleControllerError = (
  res: Response,
  error: unknown,
  verbose: boolean,
) => {
  if (error instanceof ServiceError) {
    res.status(error.status).json({
      message: error.message,
      ...(error.errors ? { errors: error.errors } : []),
    });
  } else {
    verbose && console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export { handleControllerError };
