import { Router, Request, Response } from "express";
import authRoutes from "./authRoutes";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);

// Health Check Endpoint
router.get("/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Backend Starter API Health Check",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

export default router;
