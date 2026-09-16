import express from 'express';
import {
  createQuery,
  getQueries,
  respondQuery,
} from '../controllers/queryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getQueries)
  .post(authorize('Student'), createQuery);

router.put('/:id/respond', authorize('Teacher', 'Admin'), respondQuery);

export default router;
