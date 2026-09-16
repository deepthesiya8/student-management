import express from 'express';
import {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('Admin'), getAdminDashboard);
router.get('/teacher', authorize('Teacher'), getTeacherDashboard);
router.get('/student', authorize('Student'), getStudentDashboard);

export default router;
