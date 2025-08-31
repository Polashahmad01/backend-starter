import cors from "cors";
import { config } from "../config";

// CORS configuration
export const corsOptions = cors({
  origin: config.cors.origin,
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
