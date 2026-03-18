import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authMiddleware, permitRoles('admin'), createCategory);
router.put('/:id', authMiddleware, permitRoles('admin'), updateCategory);
router.delete('/:id', authMiddleware, permitRoles('admin'), deleteCategory);

export default router;


