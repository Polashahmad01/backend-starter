import z from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../types/auth";

// Validation schemas using Zod
export const registerSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required")
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

// Validation middleware factory
export const validate = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch(error) {
      if(error instanceof z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join(".")}: ${err.message}`);
        next(new ValidationError(errorMessages.join(", ")));
      } else {
        next(new ValidationError("Invalid request data"));
      }
    }
  }
}