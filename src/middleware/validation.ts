import z from "zod";
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../types";

// Validation middleware factory
export const validate = (schema: z.ZodType<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map(err => `${err.path.join(".")}: ${err.message}`);
        next(new ValidationError(errorMessages.join(", ")));
      } else {
        next(new ValidationError("Invalid request data"));
      }
    }
  }
}
