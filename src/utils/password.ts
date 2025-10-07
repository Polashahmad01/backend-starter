import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { appConfig } from "../config";

// Hash a password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, appConfig.security.bcryptRounds);
}

// Compare a plain text password with a hashed password
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
}

// Generate a secure random token
export const generateSecureToken = (): string => {
  return randomBytes(32).toString("hex");
}
