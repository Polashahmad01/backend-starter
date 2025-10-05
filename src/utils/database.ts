import mongoose from "mongoose";
import colors from "colors";
import { appConfig } from "../config";

// Connect to MongoDB
export const connectDatabase = async (): Promise<void> => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 4500
    }

    await mongoose.connect(`mongodb+srv://${appConfig.database.mongoUserName}:${appConfig.database.mongoPassword}@default.kp5ds1b.mongodb.net/${appConfig.database.mongoDbName}?retryWrites=true&w=majority&appName=default`, options);
    console.log(colors.bgYellow.white.bold("✅ Connected to MongoDB successfully"));

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error(colors.bgRed.white.bold("MongoDB connection error: "), error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log(colors.bgRed.white.bold("MongoDB disconnected"));
    });

    mongoose.connection.on("reconnected", () => {
      console.log(colors.bgYellow.white.bold("MongoDB reconnected"));
    });

  } catch (error) {
    console.error(colors.bgRed.white.bold("Failed to connect to MongoDB:"), error);
    console.log(colors.bgRed.white.bold("💡 To run this project, you need MongoDB installed and running."));
    console.log(colors.bgRed.white.bold("💡 Install MongoDB: https://docs.mongodb.com/manual/installation/"));
    console.log(colors.bgRed.white.bold("💡 Or use MongoDB Atlas: https://www.mongodb.com/cloud/atlas"));
    console.log(colors.bgRed.white.bold("💡 Update MONGODB_URI in .env file with your connection string"));
    process.exit(1);
  }
}

// Disconnect from MongoDB
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log(colors.bgYellow.white.bold("✅ Disconnected from MongoDB successfully"));
  } catch (error) {
    console.error(colors.bgRed.white.bold("Error disconnecting from MongoDB:"), error);
  }
}

// Check if database connection is ready
export const isDatabaseReady = (): boolean => {
  return mongoose.connection.readyState === 1;
}
