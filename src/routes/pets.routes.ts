import express from "express";
import {
  deletePetController,
  getPetController,
  getPetHistoryController,
  getPetsController,
  postPetController,
  postPetStatusController,
} from "../controllers/pets.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import petActions from "../config/pet-actions.json";
import fs from "fs";

const router = express.Router();
router.get("/", authMiddleware, getPetsController);
router.get("/:id", authMiddleware, getPetController);
router.post("/", authMiddleware, postPetController);
router.get("/:id/history", authMiddleware, getPetHistoryController);
router.delete("/:id", authMiddleware, deletePetController);
// Check config/pet-actions.json file
Object.entries(petActions).forEach(([action, updates]) => {
  router.post(`/:id/${action}`, authMiddleware, (req, res) =>
    postPetStatusController(req, res, action, updates),
  );
});

export { router as petsRoute };
