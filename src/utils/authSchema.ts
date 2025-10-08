import z from "zod";

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const resendVerificationEmailSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
});

export const loginSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email format").toLowerCase()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional()
}).or(z.object({}));

// Validation schemas using Zod
export const registerSchema = z.object({
  email: z.email("Invalid email format").toLowerCase(),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
  fullName: z.string()
    .min(1, "Full name is required")
    .max(50, "Full name must be less than 50 characters"),
});
