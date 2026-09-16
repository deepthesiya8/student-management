import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Middleware to verify JWT token and authenticate user
export const protect = async (req, res, next) => {
  let token;

  // Check if token is provided in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please provide a valid token.',
    });
  }

  try {
    // Verify token using secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'student_mgmt_mern_secret_key_2026_ddu');

    // Find user by ID without password
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    req.user = user;

    // Attach student or teacher profile if role matches
    if (user.role === 'Student') {
      req.student = await Student.findOne({ user: user._id });
    } else if (user.role === 'Teacher') {
      req.teacher = await Teacher.findOne({ user: user._id });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

// Middleware for role-based access control (Admin, Teacher, Student)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`,
      });
    }
    next();
  };
};
