import express from "express";
import { getPet, getPets, postPet } from "../controllers/PetsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", authMiddleware, getPets);
router.get("/:id", authMiddleware, getPet);
router.post("/", authMiddleware, postPet);

export { router as petsRoute };
