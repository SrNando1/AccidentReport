// src/app.js
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import uploadRoutes from "./routes/upload.js";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import reportsRoutes from "./routes/reports.js";
import vehiclesRouter from "./routes/vehicles.js";
import draftsRouter from "./routes/drafts.js";
import usersRouter from "./routes/users.js";
import employersRouter from "./routes/employers.js";
import statsRouter from "./routes/stats.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Torna a pasta 'uploads' pública em /files
app.use("/files", express.static(path.join(__dirname, "uploads")));

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/users", usersRouter);
app.use("/api/employers", employersRouter);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API rodando na porta ${port}`));

app.use("/api/vehicles", vehiclesRouter);

app.use("/api/drafts", draftsRouter);

app.use("/api/stats", statsRouter);
