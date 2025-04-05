import express from "express";
import { getProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
router.get("/", authMiddleware, getProfileController);

export { router as profileRoute };
