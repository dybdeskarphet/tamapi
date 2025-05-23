import dotenv from "dotenv";
import express, { Express } from "express";
import ip from "ip";
import { ok } from "./helpers";
import { authRoute } from "./routes/auth.routes";
import YAML from "yamljs";
import swaggerUi from "swagger-ui-express";
import { rootController } from "./controllers/root.controller";
import { petsRoute } from "./routes/pets.routes";
import { connectDatabase } from "./db";
import path from "path";
import { profileRoute } from "./routes/profile.routes";

connectDatabase(path.basename(__filename));

dotenv.config();
const app: Express = express();
const port = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoute);
app.use("/pets", petsRoute);
app.use("/profile", profileRoute);

// Root
app.get("/", rootController);

app.listen(port, () => {
  ok("server", `Server running on http://${ip.address()}:${port}`);
});
