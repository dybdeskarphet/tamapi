import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { err } from "./helpers";

dotenv.config();

if (!process.env.MONGODB_URI) {
  err("db", "No database URI specified in .env");
}
