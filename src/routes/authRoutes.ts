import { Router } from "express";
import { 
    validate,
    registerSchema
} from "../middleware";
import { register } from "../controllers";

const router = Router();

// Apply rate limiting to all auth routes

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", validate(registerSchema), register);

export default router;
