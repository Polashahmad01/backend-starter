import { Request, Response, NextFunction } from "express";
import { AuthError } from "../types";
import { appConfig } from "../config";

// Global error handling middleware
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error for debugging
  console.error("Error: ", {
    message: error.message,
    statck: appConfig.nodeEnv === "development" ? error.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent")
  });

  // Handle known auth errors
  if (error instanceof AuthError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message
      }
    })
  }

  // Handle MongoDB validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.message
      }
    });
  }

  // Handle MongoDB duplicate key errors
  if (error.name === "MongoServerError" && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_ERROR",
        message: `${field} already exists`
      }
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid token"
      }
    });
  }

  // Handle JWT expired errors
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Token expired"
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: appConfig.nodeEnv === "production" ? "Internal server error" : error.message
    }
  });
}

// Not found middleware handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`
    }
  });
}
