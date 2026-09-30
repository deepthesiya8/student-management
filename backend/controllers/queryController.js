import Query from '../models/Query.js';
import Student from '../models/Student.js';

// 1. Create Query
export const createQuery = async (req, res, next) => {
  try {
    const student = req.student || (await Student.findOne({ user: req.user._id }));
    const newQuery = await Query.create({
      student: student ? student._id : null,
      teacher: req.body.teacherId,
      queryText: req.body.queryText,
    });

    res.status(201).json({ success: true, message: 'Query submitted', query: newQuery });
  } catch (error) {
    next(error);
  }
};

// 2. Get Queries
export const getQueries = async (req, res, next) => {
  try {
    const queries = await Query.find()
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1 });

    res.json({ success: true, count: queries.length, queries });
  } catch (error) {
    next(error);
  }
};

// 3. Respond to Query
export const respondQuery = async (req, res, next) => {
  try {
    const updated = await Query.findByIdAndUpdate(
      req.params.id,
      { response: req.body.response, status: 'Answered', answeredAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: 'Query not found' });

    res.json({ success: true, message: 'Response submitted', query: updated });
  } catch (error) {
    next(error);
  }
};
