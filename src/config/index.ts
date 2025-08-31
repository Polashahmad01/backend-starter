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
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()) : 
    ["http://localhost:3000"]
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "your_super_secret_jwt_access_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your_jwt_refresh_secret_key",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },
  app: {
    name: process.env.APP_NAME || "BACKEND_STARTER",
    url: process.env.APP_URL || "http://localhost:8000",
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000"
  },
  email: {
    from: process.env.EMAIL_FROM || "DEFAULT_EMAIL_FROM",
    service: process.env.EMAIL_SERVICE || "GMAIL",
    user: process.env.EMAIL_USER || "DEFAULT_EMAIL_USER",
    password: process.env.EMAIL_PASSWORD || "DEFAULT_EMAIL_PASSWORD"
  }
}
