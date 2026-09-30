import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';
import Notification from '../models/Notification.js';
import Query from '../models/Query.js';

// 1. Admin Dashboard
export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalUsers = await User.countDocuments();

    // Overall attendance rate
    const totalAtt = await Attendance.countDocuments();
    const presentAtt = await Attendance.countDocuments({ status: 'Present' });
    const overallAttendanceRate = totalAtt > 0 ? Number(((presentAtt / totalAtt) * 100).toFixed(2)) : 100;

    res.json({
      success: true,
      stats: { totalStudents, totalTeachers, totalCourses, totalUsers, overallAttendanceRate },
    });
  } catch (error) {
    next(error);
  }
};

// 2. Teacher Dashboard
export const getTeacherDashboard = async (req, res, next) => {
  try {
    const teacher = req.teacher || (await Teacher.findOne({ user: req.user._id }));
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

    const assignedCourses = await Course.find({ teacher: teacher._id });
    const pendingQueriesCount = await Query.countDocuments({ teacher: teacher._id, status: 'Pending' });

    res.json({
      success: true,
      stats: { assignedCoursesCount: assignedCourses.length, pendingQueriesCount },
      assignedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Student Dashboard
export const getStudentDashboard = async (req, res, next) => {
  try {
    const student = req.student || (await Student.findOne({ user: req.user._id }));
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const enrolledCourses = await Course.find({ enrolledStudents: student._id });

    // Attendance percentage
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    const attendancePercentage = totalAttendance > 0 ? Number(((presentCount / totalAttendance) * 100).toFixed(2)) : 100;

    // Recent marks and notifications
    const recentMarks = await Marks.find({ student: student._id }).populate('course', 'courseName').limit(5);
    const notifications = await Notification.find().sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      enrolledCoursesCount: enrolledCourses.length,
      attendanceSummary: { totalAttendance, presentCount, attendancePercentage },
      enrolledCourses,
      recentMarks,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};
