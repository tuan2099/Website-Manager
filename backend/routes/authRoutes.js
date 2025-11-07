import express from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { loginLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { registerValidator, loginValidator } from '../utils/validators.js';

const router = express.Router();

router.post('/register', validate(registerValidator), authController.register);
router.post('/login', loginLimiter, validate(loginValidator), authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateToken, authController.getMe);

export default router;
