import express, { Request, Response } from "express";
import colors from "colors";
import cookieParser from "cookie-parser";

import { appConfig } from "./config";
import {
  connectDatabase,
  disconnectDatabase
} from "./utils/database";
import {
  securityHeaders,
  corsOptions,
  generalRateLimit,
  notFoundHandler,
  errorHandler
} from "./middleware";
import routes from "./routes";

// Create express application
export const createApp = async (): Promise<express.Application> => {
  const app = express();

  // Trust proxy for accurate IP addresses
  // app.set("trust proxy", 1);

  // Security middleware
  app.use(securityHeaders);
  app.use(corsOptions);
  app.use(generalRateLimit);

  // Body parsing middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));
  app.use(cookieParser(appConfig.security.cookieSecret));

  // API routes
  app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Welcome to the Backend Starter API"
    });
  });

  app.use("/api", routes);

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
}

// Start the server
export const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();

    // Create app
    const app = await createApp();

    // Start server
    const server = app.listen(8000, () => {
      console.log(colors.bgYellow.white.bold(`🚀 Server running on port: ${appConfig.port}`));
      console.log(colors.bgYellow.white.bold(`📝 Environment: ${appConfig.nodeEnv}`));
      console.log(colors.bgYellow.white.bold(`🔗 BASE API URL: ${appConfig.baseApiUrl}`));
      console.log(colors.bgYellow.white.bold(`📚 Health Check:: ${appConfig.healthCheckApiUrl}`));
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(colors.bgRed.white.bold(`\n${signal} received. Starting graceful shutdown...`));

      server.close(async () => {
        console.log(colors.bgRed.white.bold("HTTP server closed."));

        try {
          // Close database connection
          await disconnectDatabase();
          console.log(colors.bgRed.white.bold("Database connection closed."));
          process.exit(0);

        } catch (error) {
          console.error(colors.bgRed.white.bold("Error during graceful shutdown: "), error);
          process.exit(1);
        }
      });
    }

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    console.error(colors.bgRed.white.bold("❌ Failed to start server: "), error);
    process.exit(1);
  }
}
