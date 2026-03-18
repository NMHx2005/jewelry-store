import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jewelry-store',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif', 'svg'],
  },
});

export const uploadSingleImage = multer({ storage }).single('image');

export const uploadMultipleImages = multer({ storage }).array('images', 10);

