import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import ip from "ip";
import { ok } from "./helpers";
import { authRoute } from "./routes/auth";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";

dotenv.config();
const app: Express = express();
const openapiSpec = YAML.load("./openapi.yaml");
const port = process.env.API_PORT || 3000;
openapiSpec.servers = [
  {
    url: `http://${ip.address()}:${port}`,
    description: "Local server",
  },
];

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoute);

// Setup API doc
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Root
app.get("/", (req: Request, res: Response) => {
  res.send("Say hello to Tamapi");
  return;
});

app.listen(port, () => {
  ok("server", `Server running on http://${ip.address()}:${port}`);
});
