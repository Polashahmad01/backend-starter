import { Router, Request, Response } from "express";

const router = Router();

// Health Check Endpoint
router.get("/v1/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Backend Starter API Health",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

export default router;
