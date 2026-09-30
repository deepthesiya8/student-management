import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// 1. Get all teachers
export const getTeachers = async (req, res, next) => {
  try {
    const { department } = req.query;
    let query = department ? { department } : {};

    const teachers = await Teacher.find(query).populate('user', 'name email contactNo avatar');
    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    next(error);
  }
};

// 2. Get single teacher by ID
export const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('user', 'name email contactNo avatar');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const assignedCourses = await Course.find({ teacher: teacher._id });
    res.json({ success: true, teacher, assignedCourses });
  } catch (error) {
    next(error);
  }
};

// 3. Create teacher
export const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, teacherId, department, designation, qualification } = req.body;

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
      qualification: qualification || 'M.Tech',
    });

    res.status(201).json({ success: true, message: 'Teacher created', teacher });
  } catch (error) {
    next(error);
  }
};

// 4. Update teacher
export const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    if (req.body.name || req.body.contactNo) {
      await User.findByIdAndUpdate(teacher.user, { name: req.body.name, contactNo: req.body.contactNo });
    }

    res.json({ success: true, message: 'Teacher updated', teacher });
  } catch (error) {
    next(error);
  }
};

// 5. Delete teacher
export const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    await User.findByIdAndDelete(teacher.user);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    next(error);
  }
};
