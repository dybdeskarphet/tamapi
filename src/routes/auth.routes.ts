import express from "express";
import {
  devAccess,
  getAuthRoot,
  postAuthLogin,
  postAuthRegister,
} from "../controllers/auth.controller";

const router = express.Router();
router.get("/", getAuthRoot);
router.post("/register", postAuthRegister);
router.post("/login", postAuthLogin);
router.post("/dev-access", devAccess);

export { router as authRoute };
