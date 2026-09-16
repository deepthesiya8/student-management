import express from 'express';
import {
  recordAttendance,
  updateAttendance,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceReport,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Teacher', 'Admin'), recordAttendance);
router.put('/:id', authorize('Teacher', 'Admin'), updateAttendance);
router.get('/course/:courseId', authorize('Teacher', 'Admin'), getCourseAttendance);
router.get('/student/:studentId', getStudentAttendance);
router.get('/report', authorize('Teacher', 'Admin'), getAttendanceReport);

export default router;
