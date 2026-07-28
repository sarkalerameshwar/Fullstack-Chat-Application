import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import { rateLimit } from "express-rate-limit";
import slowDown from "express-slow-down";
import logger from "../lib/logger.js";

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:5001",
  "http://localhost:3000",
  "http://localhost",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:5001",
  "http://127.0.0.1:3000",
  "https://chattx.app",
  "https://www.chattx.app",
];

export function getAllowedOrigins() {
  if (!process.env.CLIENT_URL) return defaultOrigins;
  const configured = process.env.CLIENT_URL.split(",").map((v) => v.trim()).filter(Boolean);
  return Array.from(new Set([...configured, ...defaultOrigins]));
}

export const allowedOrigins = getAllowedOrigins();

export const securityHeaders = helmet({
  contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], imgSrc: ["'self'", "data:", "https:"], connectSrc: ["'self'", ...getAllowedOrigins()], mediaSrc: ["'self'", "blob:"], styleSrc: ["'self'", "'unsafe-inline'"], scriptSrc: ["'self'"] } },
  crossOriginResourcePolicy: { policy: "cross-origin" },
});
export const globalLimiter = rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false });
export const loginLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false, message: { message: "Too many attempts. Try again shortly." } });
export const registerLimiter = rateLimit({ windowMs: 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
export const forgotLimiter = rateLimit({ windowMs: 3_600_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
export const otpLimiter = rateLimit({ windowMs: 600_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false });
export const messageLimiter = rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: "draft-8", legacyHeaders: false });
export const callLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });
export const apiSlowDown = slowDown({ windowMs: 60_000, delayAfter: 100, delayMs: () => 200, maxDelayMs: 2_000 });

export function requestOriginGuard(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (!origin) return next();

  const host = req.get("host");
  if (host && (origin === `http://${host}` || origin === `https://${host}`)) return next();

  const allowed = getAllowedOrigins();
  if (!allowed.includes(origin)) {
    return res.status(403).json({ message: "Invalid request origin" });
  }
  next();
}
export const sanitizeInput = [mongoSanitize(), hpp()];
export function auditErrors(err, req, res, next) {
  logger.error("request_failed", { path: req.originalUrl, method: req.method, status: err.status || 500, error: err.message });
  res.status(err.status || 500).json({ message: err.expose ? err.message : "Internal server error" });
}
