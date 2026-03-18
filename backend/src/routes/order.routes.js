import express from 'express';
import {
  createOrderFromCart,
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/my', authMiddleware, getMyOrders);
router.get('/', authMiddleware, permitRoles('admin'), getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, permitRoles('admin'), updateOrderStatus);
router.post('/:id/cancel', authMiddleware, cancelOrder);

export default router;


