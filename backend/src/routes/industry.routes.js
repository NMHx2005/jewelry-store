import express from 'express';
import {
  getIndustries,
  getIndustryBySlug,
  createIndustry,
  updateIndustry,
  deleteIndustry,
} from '../controllers/industryController.js';
import authMiddleware from '../middleware/auth.middleware.js';
import permitRoles from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', getIndustries);
router.get('/:slug', getIndustryBySlug);
router.post('/', authMiddleware, permitRoles('admin'), createIndustry);
router.put('/:id', authMiddleware, permitRoles('admin'), updateIndustry);
router.delete('/:id', authMiddleware, permitRoles('admin'), deleteIndustry);

export default router;
