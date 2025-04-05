import { Request, Response } from "express";
import { handleControllerError } from "../utils/error-response";
import { getUser } from "../utils/user.utils";

const getProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await getUser({ _id: req.userId }, false, true, []);
    res.status(200).json({
      message: "User details listed.",
      data: { user },
    });
    return;
  } catch (error) {
    handleControllerError(res, error);
    return;
  }
};

export { getProfileController };
