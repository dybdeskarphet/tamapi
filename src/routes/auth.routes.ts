import express from "express";
import {
  getAuthRoot,
  postAuthLoginController,
  postAuthRegisterController,
} from "../controllers/auth.controller";

const router = express.Router();
router.get("/", getAuthRoot);
router.post("/register", postAuthRegisterController);
router.post("/login", postAuthLoginController);

export { router as authRoute };
