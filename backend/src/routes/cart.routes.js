import express from 'express';
import { getCart, addToCart, updateCart, removeFromCart } from '../controllers/cartController.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getCart);
router.post('/add', authMiddleware, addToCart);
router.put('/update', authMiddleware, updateCart);
router.delete('/remove/:productId', authMiddleware, removeFromCart);

export default router;


