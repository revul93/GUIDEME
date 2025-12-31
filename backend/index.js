import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import apiRoutes from "./routes/api.js";
import logger from "./utils/logger.js";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined", { stream: logger.stream }));
} else {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

app.set("trust proxy", true);

app.get("/PING", (req, res) => {
  res.status(200).json({
    success: true,
    message: "PONG",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", apiRoutes);

app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(`Health check: http://localhost:${PORT}/PING`);
});

export default app;
