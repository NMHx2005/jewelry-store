import express from 'express';
import {
  login,
  register,
  me,
  logout,
  refreshToken,
} from '../controllers/authController.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);
router.post('/refresh-token', authMiddleware, refreshToken);

export default router;

