import express from "express";
import colors from "colors";
import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./utils/database";

// Create express application
export const createApp = async (): Promise<express.Application> => {
  const app = express();

  // Trust proxy for accurate IP addresses

  // Security middleware

  // Body parsing middleware

  // API routes

  // 404 handler

  // Global error handler

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
    const server = app.listen(config.port, () => {
      console.log(colors.bgYellow.white.bold(`🚀 Server running on port: ${config.port}`));
      console.log(colors.bgYellow.white.bold(`📝 Environment: ${config.nodeEnv}`));
      console.log(colors.bgYellow.white.bold(`🔗 BASE API URL: ${config.baseApiUrl}`));
      console.log(colors.bgYellow.white.bold(`📚 Health Check:: ${config.healthCheckApiUrl}`));
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

        } catch(error) {
          console.error(colors.bgRed.white.bold("Error during graceful shutdown: "), error);
          process.exit(1);
        }
      });
    }

    // Listen for termination signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch(error) {
    console.error(colors.bgRed.white.bold("❌ Failed to start server: "), error);
    process.exit(1);
  }
}