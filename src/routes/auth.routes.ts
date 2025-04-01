import express from "express";
import {
  postAuthLoginController,
  postAuthRegisterController,
  postTestUserController,
} from "../controllers/auth.controller";

const router = express.Router();
router.post("/register", postAuthRegisterController);
router.post("/login", postAuthLoginController);
router.post("/test-user", postTestUserController);

export { router as authRoute };
