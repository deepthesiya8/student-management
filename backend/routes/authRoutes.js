import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Private routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/upload-photo', protect, upload.single('photo'), uploadAvatar);

export default router;
