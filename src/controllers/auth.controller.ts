import { Request, Response } from "express";
import { err } from "../helpers";
import dotenv from "dotenv";
import {
  postAuthRegisterService,
  postAuthLoginService,
} from "../services/auth.service";
import { ServiceError } from "../errors/service.error";
import { checkUserExistence, getUser } from "../utils/user.utils";
import { handleControllerError } from "../utils/error-response";

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
    res
      .status(201)
      .json({ message: "User registered successfully", data: { user } });
    return;
  } catch (error) {
    handleControllerError(res, error, VERBOSE_LOG);
    return;
  }
};

const postAuthLoginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await postAuthLoginService(email, password, "1h");
    res.status(200).json({ message: "Login successful", data: { token } });
  } catch (error) {
    handleControllerError(res, error, VERBOSE_LOG);
    return;
  }
};

const postTestUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (process.env.NODE_ENV !== "development") {
      throw new ServiceError(
        403,
        "This route is only available for developer mode.",
      );
    }

    if (
      !process.env.DEVELOPER_USERNAME ||
      !process.env.DEVELOPER_EMAIL ||
      !process.env.DEVELOPER_PASSWORD ||
      !process.env.DEVELOPER_NAME
    ) {
      err(IDENTIFIER, "All the dev variables should be set in the .env file.");
      throw new ServiceError(403, "Internal server error.");
      return;
    }

    const username = process.env.DEVELOPER_USERNAME,
      email = process.env.DEVELOPER_EMAIL,
      password = process.env.DEVELOPER_PASSWORD,
      name = process.env.DEVELOPER_NAME;

    let user = await getUser({ username }, true, false);
    if (!user) {
      user = await postAuthRegisterService(email, name, username, password);
    }

    const token = await postAuthLoginService(email, password, "90d");
    res
      .status(200)
      .json({ message: "Login successful", data: { user, token } });
  } catch (error) {
    handleControllerError(res, error, VERBOSE_LOG);
    return;
  }
};

export {
  postAuthRegisterController,
  postAuthLoginController,
  postTestUserController,
};
