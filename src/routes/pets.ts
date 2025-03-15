import express from "express";
import {
  feedPet,
  getPet,
  getPets,
  postPet,
} from "../controllers/PetsController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = express.Router();
router.get("/", authMiddleware, getPets);
router.get("/:id", authMiddleware, getPet);
router.post("/", authMiddleware, postPet);
router.post("/:id/feed", authMiddleware, feedPet);

export { router as petsRoute };
