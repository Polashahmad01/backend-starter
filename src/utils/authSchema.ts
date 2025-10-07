import z from "zod";

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
