import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Helper function to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'student_mgmt_mern_secret_key_2026_ddu',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register a new student user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, studentId, department, semester } = req.body;

    // Check if email is already registered
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    // Check if student ID is unique
    if (studentId) {
      const studentIdExists = await Student.findOne({ studentId });
      if (studentIdExists) {
        return res.status(400).json({
          success: false,
          message: 'A student with this Student ID/Roll number already exists',
        });
      }
    }

    // Create User document
    const user = await User.create({
      name,
      email,
      password,
      contactNo: contactNo || '',
      role: 'Student',
    });

    // Create linked Student profile document
    const student = await Student.create({
      user: user._id,
      studentId: studentId || `STU${Date.now().toString().slice(-5)}`,
      department: department || 'Computer Engineering',
      semester: semester || 1,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        role: user.role,
        avatar: user.avatar,
      },
      studentProfile: student,
    });
  } catch (error) {
    next(error);
  }
};

// Login user and return JWT token
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password using bcrypt
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    // Fetch related profile details if teacher or student
    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ user: user._id });
    } else if (user.role === 'Teacher') {
      profile = await Teacher.findOne({ user: user._id });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNo: user.contactNo,
        role: user.role,
        avatar: user.avatar,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Get current logged-in user profile
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
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

// Update user profile details
export const updateProfile = async (req, res, next) => {
  try {
    const { name, contactNo, department, semester, designation, qualification, guardianName, guardianContact } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (contactNo !== undefined) user.contactNo = contactNo;
    await user.save();

    // Update profile based on role
    let profile = null;
    if (user.role === 'Student') {
      profile = await Student.findOne({ user: user._id });
      if (profile) {
        if (department) profile.department = department;
        if (semester) profile.semester = semester;
        if (guardianName !== undefined) profile.guardianName = guardianName;
        if (guardianContact !== undefined) profile.guardianContact = guardianContact;
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
      message: 'Profile updated successfully',
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Change user password
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Upload profile photo
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select an image file to upload',
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      avatar: avatarUrl,
      user,
    });
  } catch (error) {
    next(error);
  }
};
