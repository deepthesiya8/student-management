import express from 'express';
import {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  assignTeacher,
  assignStudents,
} from '../controllers/courseController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('Admin'), createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(authorize('Admin'), updateCourse)
  .delete(authorize('Admin'), deleteCourse);

router.post('/:id/assign-teacher', authorize('Admin'), assignTeacher);
router.post('/:id/assign-students', authorize('Admin', 'Teacher'), assignStudents);

export default router;
