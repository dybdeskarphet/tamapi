import express from "express";
import {
  deletePet,
  feedPet,
  getPet,
  getPetHistory,
  getPets,
  postPet,
  sleepPet,
} from "../controllers/PetsController";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();
router.get("/", authMiddleware, getPets);
router.get("/:id", authMiddleware, getPet);
router.post("/", authMiddleware, postPet);
router.post("/:id/feed", authMiddleware, feedPet);
router.post("/:id/sleep", authMiddleware, sleepPet);
router.get("/:id/history", authMiddleware, getPetHistory);
router.delete("/:id", authMiddleware, deletePet);

export { router as petsRoute };
