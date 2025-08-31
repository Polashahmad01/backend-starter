import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { config } from "../config";

// Hash a password using bcrypt
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptRounds);
}

// Generate a secure random token
export const generateSecureToken = (): string => {
  return randomBytes(32).toString("hex");
}
