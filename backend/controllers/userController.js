import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// 1. Get all users (Admin only)
export const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// 2. Get single user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = null;
    if (user.role === 'Student') profile = await Student.findOne({ user: user._id });
    if (user.role === 'Teacher') profile = await Teacher.findOne({ user: user._id });

    res.json({ success: true, user, profile });
  } catch (error) {
    next(error);
  }
};

// 3. Create user (Admin can create Admin/Teacher/Student)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, role } = req.body;

    const user = await User.create({
      name,
      email,
      password: password || '123456',
      contactNo: contactNo || '',
      role: role || 'Student',
    });

    res.status(201).json({ success: true, message: 'User created successfully', user });
  } catch (error) {
    next(error);
  }
};

// 4. Update user
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'User updated', user });
  } catch (error) {
    next(error);
  }
};

// 5. Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Also delete associated profile
    await Student.findOneAndDelete({ user: user._id });
    await Teacher.findOneAndDelete({ user: user._id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
