import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// Get all teachers with optional department filter
export const getTeachers = async (req, res, next) => {
  try {
    const { department, search } = req.query;

    let filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };

    let teachers = await Teacher.find(filter)
      .populate('user', 'name email contactNo avatar')
      .sort({ teacherId: 1 });

    if (search) {
      const term = search.toLowerCase();
      teachers = teachers.filter(
        (t) =>
          (t.teacherId && t.teacherId.toLowerCase().includes(term)) ||
          (t.user && t.user.name && t.user.name.toLowerCase().includes(term)) ||
          (t.user && t.user.email && t.user.email.toLowerCase().includes(term))
      );
    }

    res.json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    next(error);
  }
};

// Get single teacher by ID with assigned courses
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email contactNo avatar role');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const assignedCourses = await Course.find({ teacher: teacher._id });

    res.json({
      success: true,
      teacher,
      assignedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new teacher profile (Admin)
export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, teacherId, department, designation, qualification } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const existingId = await Teacher.findOne({ teacherId });
    if (existingId) {
      return res.status(400).json({ success: false, message: 'Teacher ID already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || '123456',
      contactNo: contactNo || '',
      role: 'Teacher',
    });

    const teacher = await Teacher.create({
      user: user._id,
      teacherId,
      department,
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'M.Tech / Ph.D',
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher,
    });
  } catch (error) {
    next(error);
  }
};

// Update teacher details
export const updateTeacher = async (req, res, next) => {
  try {
    const { name, contactNo, department, designation, qualification } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (department) teacher.department = department;
    if (designation) teacher.designation = designation;
    if (qualification) teacher.qualification = qualification;
    await teacher.save();

    if (name || contactNo !== undefined) {
      const user = await User.findById(teacher.user);
      if (user) {
        if (name) user.name = name;
        if (contactNo !== undefined) user.contactNo = contactNo;
        await user.save();
      }
    }

    const updatedTeacher = await Teacher.findById(teacher._id).populate('user', 'name email contactNo avatar');

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
};

// Delete teacher profile
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await Course.updateMany({ teacher: teacher._id }, { $unset: { teacher: '' } });
    await User.findByIdAndDelete(teacher.user);
    await Teacher.findByIdAndDelete(teacher._id);

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
