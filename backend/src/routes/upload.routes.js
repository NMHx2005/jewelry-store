import express from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';
import { uploadSingleImage } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/image', authMiddleware, permitRoles('admin'), uploadSingleImage, uploadImage);
router.delete('/image', authMiddleware, permitRoles('admin'), deleteImage);

export default router;


