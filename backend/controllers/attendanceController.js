import Attendance from '../models/Attendance.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';

// Record attendance (Single student or Batch of students)
export const recordAttendance = async (req, res, next) => {
  try {
    const { courseId, date, records } = req.body;

    const course = await Course.findById(courseId || req.body.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    const teacherId = req.teacher ? req.teacher._id : course.teacher;

    // Handle batch attendance
    if (Array.isArray(records)) {
      const results = [];
      for (const item of records) {
        const student = await Student.findById(item.studentId);
        if (student) {
          const updated = await Attendance.findOneAndUpdate(
            {
              student: student._id,
              course: course._id,
              date: {
                $gte: new Date(attendanceDate),
                $lt: new Date(new Date(attendanceDate).setDate(attendanceDate.getDate() + 1)),
              },
            },
            {
              student: student._id,
              course: course._id,
              teacher: teacherId,
              date: attendanceDate,
              status: item.status || 'Present',
              remarks: item.remarks || '',
            },
            { upsert: true, new: true }
          );
          results.push(updated);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Attendance recorded for ${results.length} students`,
        attendance: results,
      });
    }

    // Handle single student attendance
    const { studentId, status, remarks } = req.body;
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const record = await Attendance.findOneAndUpdate(
      {
        student: student._id,
        course: course._id,
        date: {
          $gte: new Date(attendanceDate),
          $lt: new Date(new Date(attendanceDate).setDate(attendanceDate.getDate() + 1)),
        },
      },
      {
        student: student._id,
        course: course._id,
        teacher: teacherId,
        date: attendanceDate,
        status: status || 'Present',
        remarks: remarks || '',
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// Update single attendance record
export const updateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// Get course attendance sheet
export const getCourseAttendance = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    let query = { course: req.params.courseId };

    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);
      query.date = { $gte: d, $lt: nextD };
    } else if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      attendance: records,
    });
  } catch (error) {
    next(error);
  }
};

// Get student attendance history and percentage
export const getStudentAttendance = async (req, res, next) => {
  try {
    if (req.user.role === 'Student' && req.student && req.student._id.toString() !== req.params.studentId) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own attendance' });
    }

    const { courseId } = req.query;
    let query = { student: req.params.studentId };
    if (courseId) query.course = courseId;

    const records = await Attendance.find(query)
      .populate('course', 'courseCode courseName')
      .sort({ date: -1 });

    const totalClasses = records.length;
    const presentClasses = records.filter((r) => r.status === 'Present').length;
    const lateClasses = records.filter((r) => r.status === 'Late').length;
    const absentClasses = records.filter((r) => r.status === 'Absent').length;

    const percentage = totalClasses > 0 ? (((presentClasses + lateClasses) / totalClasses) * 100).toFixed(2) : 100;

    res.json({
      success: true,
      summary: {
        totalClasses,
        presentClasses,
        lateClasses,
        absentClasses,
        percentage: Number(percentage),
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// Generate overall attendance report
export const getAttendanceReport = async (req, res, next) => {
  try {
    const { courseId, department, semester } = req.query;

    let matchCourse = {};
    if (courseId) matchCourse._id = courseId;
    if (department) matchCourse.department = { $regex: department, $options: 'i' };
    if (semester) matchCourse.semester = Number(semester);

    const courses = await Course.find(matchCourse);
    const report = [];

    for (const course of courses) {
      const records = await Attendance.find({ course: course._id });
      const total = records.length;
      const present = records.filter((r) => r.status === 'Present').length;
      const rate = total > 0 ? ((present / total) * 100).toFixed(2) : 100;

      report.push({
        courseCode: course.courseCode,
        courseName: course.courseName,
        totalRecords: total,
        presentRecords: present,
        attendanceRate: Number(rate),
      });
    }

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    next(error);
  }
};
