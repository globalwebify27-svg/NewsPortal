// =============================================================================
// Global Awaaz — Express Application Entry Point
// Phase 2: Foundation Setup
// =============================================================================

import "dotenv/config";
import path from "path";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { errorHandler, notFound } from "./middleware/error.middleware";
import { createRateLimiter } from "./middleware/rateLimit.middleware";
import { requestLogger } from "./middleware/logger.middleware";
import { sanitizeInput } from "./middleware/sanitizer.middleware";
import { apiRouter } from "./routes";
import { logger } from "./config/logger";

// ─── Express App ─────────────────────────────────────────────────────────────
const app: Application = express();
const httpServer = createServer(app);

// ─── Socket.IO (Phase 14: Real-time) ─────────────────────────────────────────
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });
});

// ─── Trust Proxy (for Nginx/Cloudflare) ──────────────────────────────────────
app.set("trust proxy", 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'", "https:"],
      },
    },
  })
);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5500",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Per-Page"],
  })
);

// ─── Body Parsing & XSS Sanitization ──────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(sanitizeInput);

// ─── Compression ──────────────────────────────────────────────────────────────
app.use(compression());

// ─── Request Logging ──────────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// ─── Global Rate Limiting ─────────────────────────────────────────────────────
app.use(
  createRateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 200,
    message: "Too many requests from this IP. Please try again later.",
  })
);

// ─── Health Check (no auth) ───────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Global Awaaz CMS API",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ─── Static Uploads Directory ──────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── API Routes ───────────────────────────────────────────────────────────────
const apiVersion = process.env.API_VERSION || "v1";
app.use(`/api/${apiVersion}`, apiRouter);

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export { app, httpServer };
