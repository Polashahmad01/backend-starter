import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { appConfig } from "../config";

// Helmet security middleware configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// CORS configuration
export const corsOptions = cors({
  origin: appConfig.cors.origin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "X-CSRF-Token"
  ],
  exposedHeaders: ["X-CSRF-Token"]
});

// General rate limiting for API endpoints
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests, Please try again later"
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});
