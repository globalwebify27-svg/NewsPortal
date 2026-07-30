// =============================================================================
// Winston Logger Configuration
// =============================================================================

import winston from "winston";
import path from "path";

const { combine, timestamp, printf, colorize, json, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    process.env.NODE_ENV === "production" ? json() : combine(colorize(), logFormat)
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === "production"
      ? [
          new winston.transports.File({
            filename: path.join("logs", "error.log"),
            level: "error",
            maxsize: 10_485_760, // 10MB
            maxFiles: 5,
          }),
          new winston.transports.File({
            filename: path.join("logs", "combined.log"),
            maxsize: 10_485_760,
            maxFiles: 10,
          }),
        ]
      : []),
  ],
});

export default logger;
