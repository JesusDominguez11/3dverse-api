import { Router } from "express";
import { authLimiter, apiLimiter } from '../middlewares/security.js';
import { loginUser, registerUser, logoutUser } from "../controllers/auth.controller.js";
// import { authenticate, authorize } from "../middlewares/auth.js";

const router = Router();

// Aplicar limitador específico a rutas sensibles
router.post('/login', authLimiter, loginUser);
router.post('/logout', authLimiter, logoutUser);
router.post('/register', authLimiter, registerUser);

// Aplicar limitador general a otras rutas
// router.get('/profile', apiLimiter, authenticate, getProfile);

export default router;