import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ip from "ip";
import { err } from "./helpers";
import { log } from "./helpers";

dotenv.config();
const app: Express = express();

// Middleware
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Say hello to tamapi");
  return;
});

const port = process.env.API_PORT || 3000;

app.listen(port, () => {
  log("server", `Server running on ${ip.address()}:${port}`);
});
