import Marks from '../models/Marks.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';

// Helper function to calculate grade and pass/fail status
const calculateGrade = (percentage) => {
  if (percentage >= 85) return { grade: 'AA', status: 'Pass' };
  if (percentage >= 75) return { grade: 'AB', status: 'Pass' };
  if (percentage >= 65) return { grade: 'BB', status: 'Pass' };
  if (percentage >= 55) return { grade: 'BC', status: 'Pass' };
  if (percentage >= 45) return { grade: 'CC', status: 'Pass' };
  if (percentage >= 35) return { grade: 'CD', status: 'Pass' };
  return { grade: 'FF', status: 'Fail' };
};

// Enter student marks (Single or Batch)
export const enterMarks = async (req, res, next) => {
  try {
    const { courseId, examType, marksList, maxMarks } = req.body;

    const course = await Course.findById(courseId || req.body.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const teacherId = req.teacher ? req.teacher._id : course.teacher;

    // Batch entry for entire class
    if (Array.isArray(marksList)) {
      const results = [];
      for (const item of marksList) {
        const student = await Student.findById(item.studentId);
        if (student) {
          const updated = await Marks.findOneAndUpdate(
            {
              student: student._id,
              course: course._id,
              examType: examType || item.examType,
            },
            {
              student: student._id,
              course: course._id,
              teacher: teacherId,
              examType: examType || item.examType,
              marks: item.marks,
              maxMarks: item.maxMarks || maxMarks || 100,
              remarks: item.remarks || '',
            },
            { upsert: true, new: true }
          );
          results.push(updated);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Marks entered for ${results.length} students`,
        marks: results,
      });
    }

    // Single student marks entry
    const { studentId, marks, remarks } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const record = await Marks.findOneAndUpdate(
      {
        student: student._id,
        course: course._id,
        examType,
      },
      {
        student: student._id,
        course: course._id,
        teacher: teacherId,
        examType,
        marks,
        maxMarks: maxMarks || 100,
        remarks: remarks || '',
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully',
      marks: record,
    });
  } catch (error) {
    next(error);
  }
};

// Update marks record
export const updateMarks = async (req, res, next) => {
  try {
    const { marks, maxMarks, remarks, examType } = req.body;

    const record = await Marks.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Marks record not found' });
    }

    if (marks !== undefined) record.marks = marks;
    if (maxMarks !== undefined) record.maxMarks = maxMarks;
    if (remarks !== undefined) record.remarks = remarks;
    if (examType) record.examType = examType;

    await record.save();

    res.json({
      success: true,
      message: 'Marks updated successfully',
      marks: record,
    });
  } catch (error) {
    next(error);
  }
};

// Get student marks with calculated grades and overall percentage
export const getStudentMarks = async (req, res, next) => {
  try {
    if (req.user.role === 'Student' && req.student && req.student._id.toString() !== req.params.studentId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own marks' });
    }

    const marksList = await Marks.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName department semester credits')
      .sort({ createdAt: -1 });

    let totalMarks = 0;
    let totalMaxMarks = 0;

    const marksWithGrade = marksList.map((m) => {
      totalMarks += m.marks;
      totalMaxMarks += m.maxMarks;
      const percentage = (m.marks / m.maxMarks) * 100;
      const gradeInfo = calculateGrade(percentage);

      return {
        _id: m._id,
        course: m.course,
        examType: m.examType,
        marks: m.marks,
        maxMarks: m.maxMarks,
        percentage: Number(percentage.toFixed(2)),
        grade: gradeInfo.grade,
        status: gradeInfo.status,
        remarks: m.remarks,
      };
    });

    const overallPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;
    const overallResult = calculateGrade(overallPercentage);

    res.json({
      success: true,
      summary: {
        totalMarks,
        totalMaxMarks,
        overallPercentage: Number(overallPercentage.toFixed(2)),
        overallGrade: overallResult.grade,
        overallStatus: overallResult.status,
      },
      marks: marksWithGrade,
    });
  } catch (error) {
    next(error);
  }
};

// Get marks sheet for all students in a course
export const getCourseMarks = async (req, res, next) => {
  try {
    const { examType } = req.query;
    let query = { course: req.params.courseId };
    if (examType) query.examType = examType;

    const records = await Marks.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ marks: -1 });

    res.json({
      success: true,
      count: records.length,
      marks: records,
    });
  } catch (error) {
    next(error);
  }
};

// Generate overall marks and result report
export const getMarksReport = async (req, res, next) => {
  try {
    const { courseId, examType } = req.query;
    let query = {};
    if (courseId) query.course = courseId;
    if (examType) query.examType = examType;

    const records = await Marks.find(query)
      .populate('course', 'courseCode courseName')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      });

    const report = records.map((r) => {
      const percentage = (r.marks / r.maxMarks) * 100;
      const evaluation = calculateGrade(percentage);
      return {
        studentId: r.student ? r.student.studentId : 'N/A',
        studentName: r.student && r.student.user ? r.student.user.name : 'N/A',
        courseCode: r.course ? r.course.courseCode : 'N/A',
        courseName: r.course ? r.course.courseName : 'N/A',
        examType: r.examType,
        marks: r.marks,
        maxMarks: r.maxMarks,
        percentage: Number(percentage.toFixed(2)),
        grade: evaluation.grade,
        status: evaluation.status,
      };
    });

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
