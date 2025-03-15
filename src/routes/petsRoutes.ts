import express from "express";
import {
  feedPet,
  getPet,
  getPets,
  postPet,
  sleepPet,
} from "../controllers/PetsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", authMiddleware, getPets);
router.get("/:id", authMiddleware, getPet);
router.post("/", authMiddleware, postPet);
router.post("/:id/feed", authMiddleware, feedPet);
router.post("/:id/sleep", authMiddleware, sleepPet);

export { router as petsRoute };
