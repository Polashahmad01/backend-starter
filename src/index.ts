import colors from "colors";
import { startServer } from "./app";

startServer().catch((error) => {
  console.error(colors.bgRed.white.bold("Failed to start the application: "), error);
  process.exit(1);
});
