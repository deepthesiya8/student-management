import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Helper function to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '7d',
  });
};

// 1. Register User (Student or Teacher)
export const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      contactNo,
      role = 'Student',
      studentId,
      teacherId,
      department = 'Computer Engineering',
      semester = 1,
      designation = 'Assistant Professor',
      qualification = '',
    } = req.body;

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Check if studentId / teacherId already exists
    if (role === 'Student' && studentId) {
      const existingStudent = await Student.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ success: false, message: 'Student ID / Roll No already registered.' });
      }
    } else if (role === 'Teacher' && teacherId) {
      const existingTeacher = await Teacher.findOne({ teacherId });
      if (existingTeacher) {
        return res.status(400).json({ success: false, message: 'Teacher ID already registered.' });
      }
    }

    // Create User account
    const user = await User.create({
      name,
      email,
      password,
      contactNo: contactNo || '',
      role,
    });

    // Create Profile based on role
    let profile = null;
    if (role === 'Student') {
      profile = await Student.create({
        user: user._id,
        studentId: studentId || `STU${Date.now()}`,
        department,
        semester: Number(semester) || 1,
      });
    } else if (role === 'Teacher') {
      profile = await Teacher.create({
        user: user._id,
        teacherId: teacherId || `TCH${Date.now()}`,
        department,
        designation,
        qualification,
      });
    }

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// 2. Login User (Admin / Teacher / Student)
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user (with password)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    // Get associated profile
    let profile = null;
    if (user.role === 'Student') profile = await Student.findOne({ user: user._id });
    if (user.role === 'Teacher') profile = await Teacher.findOne({ user: user._id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// 3. Get Current User Profile (/api/auth/me)
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let profile = null;
    if (user.role === 'Student') profile = await Student.findOne({ user: user._id });
    if (user.role === 'Teacher') profile = await Teacher.findOne({ user: user._id });

    res.json({ success: true, user, profile });
  } catch (error) {
    next(error);
  }
};

// 4. Update Profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

// 5. Change Password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password wrong' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// 6. Upload Photo / Avatar
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Select an image' });

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });

    res.json({ success: true, message: 'Photo uploaded', avatar: avatarUrl, user });
  } catch (error) {
    next(error);
  }
};
