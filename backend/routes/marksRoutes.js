import express from 'express';
import {
  enterMarks,
  updateMarks,
  getStudentMarks,
  getCourseMarks,
  getMarksReport,
} from '../controllers/marksController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Teacher', 'Admin'), enterMarks);
router.put('/:id', authorize('Teacher', 'Admin'), updateMarks);
router.get('/student/:studentId', getStudentMarks);
router.get('/course/:courseId', authorize('Teacher', 'Admin'), getCourseMarks);
router.get('/report', authorize('Teacher', 'Admin'), getMarksReport);

export default router;
