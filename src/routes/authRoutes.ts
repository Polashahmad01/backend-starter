import { Router, Request, Response } from "express";

const router = Router();

// Apply rate limiting to all auth routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", (req: Request, res: Response) => {
  res.status(201).json({
    success: true,
    message: "User registered successfully"
  });
});

export default router;
