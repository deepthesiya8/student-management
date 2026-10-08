import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';

// 1. Record Attendance (Single or Batch)
export const recordAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records, studentId, status, remarks } = req.body;
    const attDate = date ? new Date(date) : new Date();

    // If batch attendance is submitted for the whole class
    if (Array.isArray(records)) {
      const savedList = [];
      for (const item of records) {
        const record = await Attendance.findOneAndUpdate(
          { student: item.studentId, course: courseId, date: attDate },
          { status: item.status || 'Present', remarks: item.remarks || '' },
          { upsert: true, new: true }
        );
        savedList.push(record);
      }
      return res.status(201).json({ success: true, message: 'Batch attendance saved', attendance: savedList });
    }

    // For single student attendance
    const newRecord = await Attendance.create({
      student: studentId,
      course: courseId,
      date: attDate,
      status: status || 'Present',
      remarks: remarks || '',
    });

    res.status(201).json({ success: true, message: 'Attendance recorded', attendance: newRecord });
  } catch (error) {
    next(error);
  }
};

// 2. Update single attendance record
export const updateAttendance = async (req, res, next) => {
  try {
    const updated = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Attendance updated', attendance: updated });
  } catch (error) {
    next(error);
  }
};

// 3. Get attendance sheet for a course
export const getCourseAttendance = async (req, res, next) => {
  try {
    const records = await Attendance.find({ course: req.params.courseId })
      .populate('student')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    next(error);
  }
};

// 4. Get student attendance history and percentage
export const getStudentAttendance = async (req, res, next) => {
  try {
    const rawRecords = await Attendance.find({ student: req.params.studentId })
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });

    // Filter out records where course might have been deleted/unlinked
    const records = rawRecords.filter((r) => r.course != null);

    const totalClasses = records.length;
    const presentClasses = records.filter((r) => r.status === 'Present').length;
    const percentage = totalClasses > 0 ? Number(((presentClasses / totalClasses) * 100).toFixed(2)) : 100;

    const summaryData = {
      totalClasses,
      presentClasses,
      absentClasses: totalClasses - presentClasses,
      percentage,
      totalAttendance: totalClasses,
      presentCount: presentClasses,
      attendancePercentage: percentage,
    };

    res.json({
      success: true,
      summary: summaryData,
      attendanceSummary: summaryData,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// 5. Overall attendance report
export const getAttendanceReport = async (req, res, next) => {
  try {
    const courses = await Course.find();
    const report = [];

    for (const course of courses) {
      const records = await Attendance.find({ course: course._id });
      const total = records.length;
      const present = records.filter((r) => r.status === 'Present').length;
      const rate = total > 0 ? Number(((present / total) * 100).toFixed(2)) : 100;

      report.push({
        courseCode: course.courseCode,
        courseName: course.courseName,
        totalRecords: total,
        presentRecords: present,
        attendanceRate: rate,
      });
    }

    res.json({ success: true, report });
  } catch (error) {
    next(error);
  }
};
