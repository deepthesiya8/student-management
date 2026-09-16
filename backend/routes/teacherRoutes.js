import express from 'express';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTeachers)
  .post(authorize('Admin'), createTeacher);

router.route('/:id')
  .get(getTeacherById)
  .put(authorize('Admin'), updateTeacher)
  .delete(authorize('Admin'), deleteTeacher);

export default router;
