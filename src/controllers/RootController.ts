import { Request, Response } from "express";

const rootController = (req: Request, res: Response) => {
  res.send("Say hello to Tamapi");
  return;
};

export { rootController };
