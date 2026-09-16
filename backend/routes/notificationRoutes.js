import express from 'express';
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications)
  .post(authorize('Admin', 'Teacher'), createNotification);

router.put('/:id/read', markAsRead);
router.delete('/:id', authorize('Admin'), deleteNotification);

export default router;
