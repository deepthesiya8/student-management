import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';
import Notification from '../models/Notification.js';
import Query from '../models/Query.js';

// Get Admin dashboard statistics
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();

    // Department-wise student breakdown
    const departmentStats = await Student.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
    ]);

    // Calculate total attendance rate
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'Present' });
    const overallAttendanceRate =
      totalAttendanceRecords > 0 ? Number(((presentRecords / totalAttendanceRecords) * 100).toFixed(2)) : 100;

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalUsers,
        overallAttendanceRate,
        departmentStats,
      },
      recentUsers,
    });
  } catch (error) {
    next(error);
  }
};

// Get Teacher dashboard statistics
export const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacher = req.teacher || (await Teacher.findOne({ user: req.user._id }));
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    const assignedCourses = await Course.find({ teacher: teacher._id }).populate(
      'enrolledStudents',
      'studentId'
    );

    let totalEnrolledStudents = 0;
    assignedCourses.forEach((c) => {
      totalEnrolledStudents += c.enrolledStudents ? c.enrolledStudents.length : 0;
    });

    const pendingQueriesCount = await Query.countDocuments({
      teacher: teacher._id,
      status: 'Pending',
    });

    const recentQueries = await Query.find({ teacher: teacher._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        assignedCoursesCount: assignedCourses.length,
        totalEnrolledStudents,
        pendingQueriesCount,
      },
      assignedCourses,
      recentQueries,
    });
  } catch (error) {
    next(error);
  }
};

// Get Student dashboard statistics
export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = req.student || (await Student.findOne({ user: req.user._id }));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const enrolledCourses = await Course.find({ enrolledStudents: student._id }).populate({
      path: 'teacher',
      populate: { path: 'user', select: 'name' },
    });

    // Attendance summary
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    const attendancePercentage =
      totalAttendance > 0 ? Number(((presentCount / totalAttendance) * 100).toFixed(2)) : 100;

    // Recent marks
    const recentMarks = await Marks.find({ student: student._id })
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Latest notifications
    const notifications = await Notification.find({
      $or: [{ targetRole: 'All' }, { targetRole: 'Student' }, { recipient: req.user._id }],
    })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      student,
      enrolledCoursesCount: enrolledCourses.length,
      attendanceSummary: {
        totalAttendance,
        presentCount,
        attendancePercentage,
      },
      enrolledCourses,
      recentMarks,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};
