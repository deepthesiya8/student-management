import Student from '../models/Student.js';
import User from '../models/User.js';
import Course from '../models/Course.js';

// 1. Get all students
export const getStudents = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;
    let query = {};

    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    let students = await Student.find(query).populate('user', 'name email contactNo avatar');

    if (search) {
      students = students.filter(
        (s) => s.studentId?.toLowerCase().includes(search.toLowerCase()) ||
               s.user?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// 2. Get single student by ID
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user', 'name email contactNo avatar');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const enrolledCourses = await Course.find({ enrolledStudents: student._id });

    res.json({ success: true, student, enrolledCourses });
  } catch (error) {
    next(error);
  }
};

// 3. Create new student
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, password, contactNo, studentId, department, semester } = req.body;

    // 1. Create User account
    const user = await User.create({
      name,
      email,
      password: password || '123456',
      contactNo: contactNo || '',
      role: 'Student',
    });

    // 2. Create Student profile
    const student = await Student.create({
      user: user._id,
      studentId,
      department,
      semester,
    });

    res.status(201).json({ success: true, message: 'Student created', student });
  } catch (error) {
    next(error);
  }
};

// 4. Update student
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Update User account if name or contactNo changed
    if (req.body.name || req.body.contactNo) {
      await User.findByIdAndUpdate(student.user, {
        name: req.body.name,
        contactNo: req.body.contactNo,
      });
    }

    res.json({ success: true, message: 'Student updated', student });
  } catch (error) {
    next(error);
  }
};

// 5. Delete student
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await User.findByIdAndDelete(student.user);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};
