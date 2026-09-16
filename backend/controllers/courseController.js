import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';

// Get all courses with department and semester filters
export const getCourses = async (req, res, next) => {
  try {
    const { department, semester, search } = req.query;

    let filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (semester) filter.semester = Number(semester);

    let courses = await Course.find(filter)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email' },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'studentId department semester',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ courseCode: 1 });

    // Search by course code or course name
    if (search) {
      const term = search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.courseCode.toLowerCase().includes(term) ||
          c.courseName.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
};

// Get single course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'teacher',
        populate: { path: 'user', select: 'name email contactNo' },
      })
      .populate({
        path: 'enrolledStudents',
        populate: { path: 'user', select: 'name email contactNo avatar' },
      });

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({
      success: true,
      course,
    });
  } catch (error) {
    next(error);
  }
};

// Create a new course (Admin only)
export const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, semester, credits, teacherId } = req.body;

    const existingCourse = await Course.findOne({ courseCode: courseCode.toUpperCase() });
    if (existingCourse) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }

    let teacher = null;
    if (teacherId) {
      teacher = await Teacher.findById(teacherId);
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase(),
      courseName,
      department,
      semester,
      credits: credits || 4,
      teacher: teacher ? teacher._id : null,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// Update course details
export const updateCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, semester, credits, teacherId } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (courseCode) course.courseCode = courseCode.toUpperCase();
    if (courseName) course.courseName = courseName;
    if (department) course.department = department;
    if (semester) course.semester = semester;
    if (credits !== undefined) course.credits = credits;
    if (teacherId !== undefined) course.teacher = teacherId || null;

    await course.save();

    res.json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// Delete course by ID
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Assign teacher to course
export const assignTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    course.teacher = teacher._id;
    await course.save();

    res.json({
      success: true,
      message: 'Teacher assigned to course successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
};

// Enroll / Assign students to course
export const assignStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ success: false, message: 'studentIds must be an array of student IDs' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Merge and remove duplicates
    const currentSet = new Set(course.enrolledStudents.map((s) => s.toString()));
    studentIds.forEach((id) => currentSet.add(id.toString()));
    course.enrolledStudents = Array.from(currentSet);

    await course.save();

    res.json({
      success: true,
      message: `${studentIds.length} student(s) assigned to course successfully`,
      totalEnrolled: course.enrolledStudents.length,
      course,
    });
  } catch (error) {
    next(error);
  }
};
