import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ip from "ip";
import { ok } from "./helpers";
import { authRoute } from "./routes/auth";

dotenv.config();
const app: Express = express();

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoute);

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("Say hello to tamapi");
  return;
});

const port = process.env.API_PORT || 3000;

app.listen(port, () => {
  ok("server", `Server running on http://${ip.address()}:${port}`);
});
