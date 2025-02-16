import mongoose from "mongoose";
import dotenv from "dotenv";
import { err, log, ok } from "./helpers";

dotenv.config();

const IDENTIFIER: string = "db";

if (!process.env.MONGODB_URI) {
  err("db", "No database URI specified in .env");
}

const connectDatabase = async (filename: string) => {
  try {
    log(IDENTIFIER, `MongoDB connecting in ${filename}`);
    await mongoose.connect(process.env.MONGODB_URI as string);
    ok(IDENTIFIER, `MongoDB connected in ${filename}`);
  } catch (error) {
    err(IDENTIFIER, `MongoDB Connection Error:\n ${error}`);
    process.exit(1); // Exit if connection fails
  }
};

export { connectDatabase };
