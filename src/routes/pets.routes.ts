import express from "express";
import {
  deletePetController,
  getPetController,
  getPetHistoryController,
  getPetsController,
  postPetController,
  postPetActionController,
  patchPetController,
} from "../controllers/pets.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import petActions from "../config/pet-actions.json";

const router = express.Router();
router.get("/", authMiddleware, getPetsController);
router.get("/:id", authMiddleware, getPetController);
router.post("/", authMiddleware, postPetController);
router.get("/:id/history", authMiddleware, getPetHistoryController);
router.delete("/:id", authMiddleware, deletePetController);
// Check config/pet-actions.json file
Object.entries(petActions).forEach(([action, updates]) => {
  router.post(`/:id/${action}`, authMiddleware, (req, res) =>
    postPetActionController(req, res, action, updates),
  );
});
router.patch("/:id", authMiddleware, patchPetController);

export { router as petsRoute };
