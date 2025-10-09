import dotenv from "dotenv";
import { AppConfig } from "../types";

dotenv.config();

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || "8000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  baseApiUrl: process.env.BASE_API_URL || "http://localhost:8000",
  healthCheckApiUrl: process.env.HEALTH_CHECK_API_URL || "http://localhost:8000/api/v1/health",
  database: {
    mongoUserName: process.env.MONGO_USERNAME || "YOUR_DEFAULT_MONGODB_USERNAME",
    mongoPassword: process.env.MONGO_PASSWORD || "YOUR_DEFAULT_MONGODB_PASSWORD",
    mongoDbName: process.env.MONGO_DB_NAME || "YOUR_DEFAULT_MONGODB_DB_NAME",
  },
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()) : ["http://localhost:3000"],
  },
  security: {
    cookieSecret: process.env.COOKIE_SECRET || "YOUR_DEFAULT_COOKIE_SECRET",
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS!, 10),
  },
  firebase: {
    serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY!,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
  },
  application: {
    appName: process.env.APP_NAME!,
    appUrl: process.env.APP_URL!,
    frontendUrl: process.env.FRONT_END_URL!
  },
  email: {
    apiKey: process.env.RESEND_API_KEY!,
    emailFrom: process.env.EMAIL_FROM!,
  }
}