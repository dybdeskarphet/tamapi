import express from "express";
import {
  getAuthRoot,
  postAuthLogin,
  postAuthRegister,
} from "../controllers/AuthController";

const router = express.Router();
router.get("/", getAuthRoot);
router.post("/register", postAuthRegister);
router.post("/login", postAuthLogin);

export { router as authRoute };
