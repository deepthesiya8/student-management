import express from 'express';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Teacher'), getStudents)
  .post(authorize('Admin'), createStudent);

router.route('/:id')
  .get(getStudentById)
  .put(authorize('Admin'), updateStudent)
  .delete(authorize('Admin'), deleteStudent);

export default router;
