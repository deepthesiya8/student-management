import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';

// Get all students with department and semester filters
export const getStudents = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;

    let filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (semester) filter.semester = Number(semester);

    let students = await Student.find(filter)
      .populate('user', 'name email contactNo avatar')
      .sort({ studentId: 1 });

    // Search by student ID or name
    if (search) {
      const term = search.toLowerCase();
      students = students.filter(
        (s) =>
          (s.studentId && s.studentId.toLowerCase().includes(term)) ||
          (s.user && s.user.name && s.user.name.toLowerCase().includes(term)) ||
          (s.user && s.user.email && s.user.email.toLowerCase().includes(term))
      );
    }

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

// Get single student by ID along with courses and attendance summary
export const getStudentById = async (req, res, next) => {
  try {
    // If student is logged in, restrict to viewing own profile
    if (req.user.role === 'Student' && req.student && req.student._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view your own student details',
      });
    }

    const student = await Student.findById(req.params.id).populate('user', 'name email contactNo avatar role');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Find enrolled courses for this student
    const enrolledCourses = await Course.find({ enrolledStudents: student._id })
      .populate('teacher', 'name email');

    // Calculate attendance percentage
    const totalAttendance = await Attendance.countDocuments({ student: student._id });
    const presentCount = await Attendance.countDocuments({ student: student._id, status: 'Present' });
    const attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(2) : 100;

    res.json({
      success: true,
      student,
      enrolledCourses,
      stats: {
        totalAttendance,
        presentCount,
        attendancePercentage: Number(attendancePercentage),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new student profile (Admin)
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, studentId, department, semester, guardianName, guardianContact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingId = await Student.findOne({ studentId });
    if (existingId) {
      return res.status(400).json({ success: false, message: 'Student ID / Roll number already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || '123456',
      contactNo: contactNo || '',
      role: 'Student',
    });

    const student = await Student.create({
      user: user._id,
      studentId,
      department,
      semester,
      guardianName: guardianName || '',
      guardianContact: guardianContact || '',
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student,
    });
  } catch (error) {
    next(error);
  }
};

// Update student details
export const updateStudent = async (req, res, next) => {
  try {
    const { name, contactNo, department, semester, guardianName, guardianContact } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (department) student.department = department;
    if (semester) student.semester = semester;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianContact !== undefined) student.guardianContact = guardianContact;
    await student.save();

    if (name || contactNo !== undefined) {
      const user = await User.findById(student.user);
      if (user) {
        if (name) user.name = name;
        if (contactNo !== undefined) user.contactNo = contactNo;
        await user.save();
      }
    }

    const updatedStudent = await Student.findById(student._id).populate('user', 'name email contactNo avatar');

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// Delete student and remove from courses
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Course.updateMany(
      { enrolledStudents: student._id },
      { $pull: { enrolledStudents: student._id } }
    );
    await Attendance.deleteMany({ student: student._id });
    await Marks.deleteMany({ student: student._id });
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(student._id);

    res.json({
      success: true,
      message: 'Student and related records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
