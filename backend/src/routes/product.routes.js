import express from 'express';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} from '../controllers/productController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';
import { uploadMultipleImages } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

router.post('/', authMiddleware, permitRoles('admin'), createProduct);
router.put('/:id', authMiddleware, permitRoles('admin'), updateProduct);
router.delete('/:id', authMiddleware, permitRoles('admin'), deleteProduct);

router.post(
  '/:id/images',
  authMiddleware,
  permitRoles('admin'),
  uploadMultipleImages,
  uploadProductImages,
);

export default router;

