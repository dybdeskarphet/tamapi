import express from "express";
import {
  deletePetController,
  feedPetController,
  getPetController,
  getPetHistoryController,
  getPetsController,
  postPetController,
  sleepPetController,
} from "../controllers/pets.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
router.get("/", authMiddleware, getPetsController);
router.get("/:id", authMiddleware, getPetController);
router.post("/", authMiddleware, postPetController);
router.post("/:id/feed", authMiddleware, feedPetController);
router.post("/:id/sleep", authMiddleware, sleepPetController);
router.get("/:id/history", authMiddleware, getPetHistoryController);
router.delete("/:id", authMiddleware, deletePetController);

export { router as petsRoute };
