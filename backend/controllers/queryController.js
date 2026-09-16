import Query from '../models/Query.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// Student submits a question/query to a teacher
export const createQuery = async (req, res, next) => {
  try {
    const { teacherId, queryText } = req.body;

    const student = req.student || (await Student.findOne({ user: req.user._id }));
    if (!student) {
      return res.status(403).json({ success: false, message: 'Only registered students can ask queries' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const query = await Query.create({
      student: student._id,
      teacher: teacher._id,
      queryText,
    });

    res.status(201).json({
      success: true,
      message: 'Query submitted successfully to teacher',
      query,
    });
  } catch (error) {
    next(error);
  }
};

// Get queries filtered by user role (Student sees own queries, Teacher sees queries sent to them)
export const getQueries = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user.role === 'Student') {
      const student = req.student || (await Student.findOne({ user: req.user._id }));
      if (student) filter.student = student._id;
    } else if (req.user.role === 'Teacher') {
      const teacher = req.teacher || (await Teacher.findOne({ user: req.user._id }));
      if (teacher) filter.teacher = teacher._id;
    }

    const queries = await Query.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: queries.length,
      queries,
    });
  } catch (error) {
    next(error);
  }
};

// Teacher replies to a query
export const respondQuery = async (req, res, next) => {
  try {
    const { response } = req.body;

    const query = await Query.findById(req.params.id);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found' });
    }

    // Verify teacher is authorized to answer
    if (req.user.role === 'Teacher' && req.teacher) {
      if (query.teacher.toString() !== req.teacher._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to respond to this query' });
      }
    }

    query.response = response;
    query.status = 'Answered';
    query.answeredAt = new Date();

    await query.save();

    res.json({
      success: true,
      message: 'Response submitted successfully',
      query,
    });
  } catch (error) {
    next(error);
  }
};
