import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';

// Get all users with optional filters (Role, Search by name/email)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search, department, semester } = req.query;

    let filter = {};

    // Filter by user role
    if (role && ['Admin', 'Teacher', 'Student'].includes(role)) {
      filter.role = role;
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    let users = await User.find(filter).sort({ createdAt: -1 });

    // Filter by department or semester if specified
    if (department || semester) {
      const studentFilter = {};
      if (department) studentFilter.department = { $regex: department, $options: 'i' };
      if (semester) studentFilter.semester = Number(semester);

      const matchingStudents = await Student.find(studentFilter).select('user');
      const studentUserIds = matchingStudents.map((s) => s.user.toString());

      const teacherFilter = {};
      if (department) teacherFilter.department = { $regex: department, $options: 'i' };
      const matchingTeachers = await Teacher.find(teacherFilter).select('user');
      const teacherUserIds = matchingTeachers.map((t) => t.user.toString());

      const allowedUserIds = new Set([...studentUserIds, ...teacherUserIds]);
      users = users.filter((u) => allowedUserIds.has(u._id.toString()));
    }

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID with profile details
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'Teacher') {
      profile = await Teacher.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new user (Admin only)
export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      contactNo,
      role,
      studentId,
      department,
      semester,
      teacherId,
      designation,
      qualification,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password: password || '123456',
      contactNo: contactNo || '',
      role: role || 'Student',
    });

    let profile = null;

    if (user.role === 'Student') {
      profile = await Student.create({
        user: user._id,
        studentId: studentId || `STU${Date.now().toString().slice(-5)}`,
        department: department || 'Computer Engineering',
        semester: semester || 1,
      });
    } else if (user.role === 'Teacher') {
      profile = await Teacher.create({
        user: user._id,
        teacherId: teacherId || `TCH${Date.now().toString().slice(-5)}`,
        department: department || 'Computer Engineering',
        designation: designation || 'Assistant Professor',
        qualification: qualification || 'M.Tech',
      });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactNo: user.contactNo,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, contactNo, role, department, semester, designation, qualification } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (contactNo !== undefined) user.contactNo = contactNo;
    if (role) user.role = role;
    await user.save();

    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ user: user._id });
      if (profile) {
        if (department) profile.department = department;
        if (semester) profile.semester = semester;
        await profile.save();
      }
    } else if (user.role === 'Teacher') {
      profile = await Teacher.findOne({ user: user._id });
      if (profile) {
        if (department) profile.department = department;
        if (designation) profile.designation = designation;
        if (qualification) profile.qualification = qualification;
        await profile.save();
      }
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user and associated records
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete linked student or teacher profile and data
    if (user.role === 'Student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        await Course.updateMany(
          { enrolledStudents: student._id },
          { $pull: { enrolledStudents: student._id } }
        );
        await Attendance.deleteMany({ student: student._id });
        await Marks.deleteMany({ student: student._id });
        await Student.findByIdAndDelete(student._id);
      }
    } else if (user.role === 'Teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        await Course.updateMany({ teacher: teacher._id }, { $unset: { teacher: '' } });
        await Teacher.findByIdAndDelete(teacher._id);
      }
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User and all associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
