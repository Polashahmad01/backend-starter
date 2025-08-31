import dotenv from "dotenv";
import { AppConfig } from "../types/auth";

// Load  environment variables
dotenv.config();

export const config: AppConfig = {
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  baseApiUrl: process.env.BASE_API_URL || "http://localhost:8000",
  healthCheckApiUrl: process.env.HEALTH_CHECK_API_URL || "http://localhost:8000/api/v1/health",
  database: {
    mongoUserName: process.env.MONGO_USERNAME || "DEFAULT_USERNAME",
    mongoPassword: process.env.MONGO_PASSWORD || "DEFAULT_PASSWORD",
    mongoDbName: process.env.MONGO_DB_NAME || "DEFAULT_DB_NAME"
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
    cookieSecret: process.env.COOKIE_SECRET || "YOUR_SUPER_SECRET_COOKIE_KEY"
  }
}
