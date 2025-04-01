import express from "express";
import {
  postAuthLoginController,
  postAuthRegisterController,
} from "../controllers/auth.controller";

const router = express.Router();
router.post("/register", postAuthRegisterController);
router.post("/login", postAuthLoginController);

export { router as authRoute };
