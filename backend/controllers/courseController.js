import Course from '../models/Course.js';

// 1. Get all courses
export const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate({
        path: 'teacher',
        select: 'teacherId department user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'studentId department semester user',
        populate: {
          path: 'user',
          select: 'name email contactNo',
        },
      });

    // Clean up any dangling references where student was removed
    const cleanedCourses = courses.map((course) => {
      const courseObj = course.toObject();
      courseObj.enrolledStudents = (courseObj.enrolledStudents || []).filter((s) => s && s._id);
      return courseObj;
    });

    res.json({ success: true, count: cleanedCourses.length, courses: cleanedCourses });
  } catch (error) {
    next(error);
  }
};

// 2. Get single course by ID
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: 'teacher',
        select: 'teacherId department user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'studentId department semester user',
        populate: {
          path: 'user',
          select: 'name email contactNo',
        },
      });

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    const courseObj = course.toObject();
    courseObj.enrolledStudents = (courseObj.enrolledStudents || []).filter((s) => s && s._id);

    res.json({ success: true, course: courseObj });
  } catch (error) {
    next(error);
  }
};

// 3. Create course
export const createCourse = async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, message: 'Course created', course });
  } catch (error) {
    next(error);
  }
};

// 4. Update course
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course updated', course });
  } catch (error) {
    next(error);
  }
};

// 5. Delete course
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// 6. Assign teacher to course
export const assignTeacher = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { teacher: req.body.teacherId },
      { new: true }
    );
    res.json({ success: true, message: 'Teacher assigned', course });
  } catch (error) {
    next(error);
  }
};

// 7. Enroll students in course
export const assignStudents = async (req, res, next) => {
  try {
    const update = req.body.replace
      ? { enrolledStudents: req.body.studentIds || [] }
      : { $addToSet: { enrolledStudents: { $each: req.body.studentIds || [] } } };

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate({
        path: 'teacher',
        select: 'teacherId department user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'studentId department semester user',
        populate: {
          path: 'user',
          select: 'name email contactNo',
        },
      });

    const courseObj = course.toObject();
    courseObj.enrolledStudents = (courseObj.enrolledStudents || []).filter((s) => s && s._id);

    res.json({ success: true, message: 'Students enrolled', course: courseObj });
  } catch (error) {
    next(error);
  }
};

// 8. Remove student from course
export const removeStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $pull: { enrolledStudents: studentId } },
      { new: true }
    )
      .populate({
        path: 'teacher',
        select: 'teacherId department user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate({
        path: 'enrolledStudents',
        select: 'studentId department semester user',
        populate: {
          path: 'user',
          select: 'name email contactNo',
        },
      });

    const courseObj = course.toObject();
    courseObj.enrolledStudents = (courseObj.enrolledStudents || []).filter((s) => s && s._id);

    res.json({ success: true, message: 'Student removed from course', course: courseObj });
  } catch (error) {
    next(error);
  }
};

