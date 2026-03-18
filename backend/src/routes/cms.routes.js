import express from 'express';
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getSettings,
  updateSettings,
} from '../controllers/cmsController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/banners', getBanners);
router.post('/banners', authMiddleware, permitRoles('admin'), createBanner);
router.put('/banners/:id', authMiddleware, permitRoles('admin'), updateBanner);
router.delete('/banners/:id', authMiddleware, permitRoles('admin'), deleteBanner);

router.get('/settings', getSettings);
router.put('/settings', authMiddleware, permitRoles('admin'), updateSettings);

export default router;


