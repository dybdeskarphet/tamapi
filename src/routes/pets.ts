import express from "express";
import { getPets } from "../controllers/PetsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", authMiddleware, getPets);

export { router as petsRoute };
