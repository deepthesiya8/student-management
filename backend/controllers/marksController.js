import Marks from '../models/Marks.js';

// Helper function to determine grading based on percentage
// 90-100: A, 80-89: B, 70-79: C, 60-69: D, 35-59: E, 0-34: F
const calculateGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A', status: 'Pass' };
  if (percentage >= 80) return { grade: 'B', status: 'Pass' };
  if (percentage >= 70) return { grade: 'C', status: 'Pass' };
  if (percentage >= 60) return { grade: 'D', status: 'Pass' };
  if (percentage >= 35) return { grade: 'E', status: 'Pass' };
  return { grade: 'F', status: 'Fail' };
};

// 1. Enter Marks (Single or Batch)
export const enterMarks = async (req, res, next) => {
  try {
    const { courseId, examType, marksList, studentId, marks, maxMarks, remarks } = req.body;

    // If batch marks are submitted for the whole class
    if (Array.isArray(marksList)) {
      const savedMarks = [];
      for (const item of marksList) {
        const doc = await Marks.findOneAndUpdate(
          { student: item.studentId, course: courseId, examType: examType || item.examType },
          { marks: item.marks, maxMarks: item.maxMarks || 100, remarks: item.remarks || '' },
          { upsert: true, new: true }
        );
        savedMarks.push(doc);
      }
      return res.status(201).json({ success: true, message: 'Batch marks saved', marks: savedMarks });
    }

    // For single student
    const newMark = await Marks.findOneAndUpdate(
      { student: studentId, course: courseId, examType },
      { marks, maxMarks: maxMarks || 100, remarks: remarks || '' },
      { upsert: true, new: true }
    );

    res.status(201).json({ success: true, message: 'Marks entered', marks: newMark });
  } catch (error) {
    next(error);
  }
};

// 2. Update marks
export const updateMarks = async (req, res, next) => {
  try {
    const updated = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Marks updated', marks: updated });
  } catch (error) {
    next(error);
  }
};

// 3. Get student marks and calculate overall grade
export const getStudentMarks = async (req, res, next) => {
  try {
    const list = await Marks.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });

    let totalMarks = 0;
    let totalMaxMarks = 0;

    const formattedMarks = list.map((item) => {
      totalMarks += item.marks;
      totalMaxMarks += item.maxMarks;
      const percentage = (item.marks / item.maxMarks) * 100;
      const evaluation = calculateGrade(percentage);

      return {
        ...item._doc,
        percentage: Number(percentage.toFixed(2)),
        grade: evaluation.grade,
        status: evaluation.status,
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    const finalResult = calculateGrade(overallPercentage);

    res.json({
      success: true,
      summary: {
        totalMarks,
        totalMaxMarks,
        overallPercentage: Number(overallPercentage.toFixed(2)),
        overallGrade: finalResult.grade,
        overallStatus: finalResult.status,
      },
      marks: formattedMarks,
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get course marks
export const getCourseMarks = async (req, res, next) => {
  try {
    const records = await Marks.find({ course: req.params.courseId })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    res.json({ success: true, count: records.length, marks: records });
  } catch (error) {
    next(error);
  }
};

// 5. Marks report
export const getMarksReport = async (req, res, next) => {
  try {
    const records = await Marks.find()
      .populate('course', 'courseCode courseName')
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

    res.json({ success: true, report: records });
  } catch (error) {
    next(error);
  }
};
