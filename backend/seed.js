import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Course from './models/Course.js';
import Attendance from './models/Attendance.js';
import Marks from './models/Marks.js';
import Notification from './models/Notification.js';
import Query from './models/Query.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/StudentManagementDB';
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB for Seeding at ${mongoUri}`);

    // Clear all existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Attendance.deleteMany({});
    await Marks.deleteMany({});
    await Notification.deleteMany({});
    await Query.deleteMany({});

    console.log('Old collections cleared.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@ddu.ac.in',
      password: 'admin123',
      contactNo: '9876543210',
      role: 'Admin',
    });

    // 2. Create Teachers (including Vrund Dobariya mentioned in SRS)
    const teacherUser1 = await User.create({
      name: 'Prof. Vrund Dobariya',
      email: 'vrund@ddu.ac.in',
      password: 'teacher123',
      contactNo: '9898012345',
      role: 'Teacher',
    });
    const teacher1 = await Teacher.create({
      user: teacherUser1._id,
      teacherId: 'TCH-CE-01',
      department: 'Computer Engineering',
      designation: 'Assistant Professor & Lab Incharge',
      qualification: 'M.Tech (Computer Engineering)',
    });

    const teacherUser2 = await User.create({
      name: 'Prof. Neha Sharma',
      email: 'neha@ddu.ac.in',
      password: 'teacher123',
      contactNo: '9898054321',
      role: 'Teacher',
    });
    const teacher2 = await Teacher.create({
      user: teacherUser2._id,
      teacherId: 'TCH-CE-02',
      department: 'Computer Engineering',
      designation: 'Associate Professor',
      qualification: 'Ph.D in Computer Science',
    });

    // 3. Create Students (Deep Bhatu & Deep Thesiya & Rahul Patel from lab doc)
    const studentUser1 = await User.create({
      name: 'Deep Thesiya',
      email: '24ceuos155@ddu.ac.in',
      password: 'student123',
      contactNo: '9712345678',
      role: 'Student',
    });
    const student1 = await Student.create({
      user: studentUser1._id,
      studentId: '24CEUOS155',
      department: 'Computer Engineering',
      semester: 6,
      guardianName: 'Thesiya Family',
      guardianContact: '9712345600',
    });

    const studentUser2 = await User.create({
      name: 'Deep Bhatu',
      email: '23ceubg010@ddu.ac.in',
      password: 'student123',
      contactNo: '9812345678',
      role: 'Student',
    });
    const student2 = await Student.create({
      user: studentUser2._id,
      studentId: '23CEUBG010',
      department: 'Computer Engineering',
      semester: 6,
      guardianName: 'Bhatu Family',
      guardianContact: '9812345600',
    });

    const studentUser3 = await User.create({
      name: 'Rahul Patel',
      email: 'rahul.patel@ddu.ac.in',
      password: 'student123',
      contactNo: '9912345678',
      role: 'Student',
    });
    const student3 = await Student.create({
      user: studentUser3._id,
      studentId: '101',
      department: 'Computer Engineering',
      semester: 6,
      guardianName: 'Patel Family',
      guardianContact: '9912345600',
    });

    // 4. Create Courses & assign teachers and students
    const course1 = await Course.create({
      courseCode: 'CE601',
      courseName: 'Advance Web Technology (MERN Stack)',
      department: 'Computer Engineering',
      semester: 6,
      credits: 4,
      teacher: teacher1._id,
      enrolledStudents: [student1._id, student2._id, student3._id],
    });

    const course2 = await Course.create({
      courseCode: 'CE602',
      courseName: 'Database Management Systems',
      department: 'Computer Engineering',
      semester: 6,
      credits: 4,
      teacher: teacher2._id,
      enrolledStudents: [student1._id, student2._id, student3._id],
    });

    const course3 = await Course.create({
      courseCode: 'CE603',
      courseName: 'Cloud Computing & DevOps',
      department: 'Computer Engineering',
      semester: 6,
      credits: 3,
      teacher: teacher1._id,
      enrolledStudents: [student1._id, student2._id],
    });

    // 5. Seed Attendance
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await Attendance.create([
      { student: student1._id, course: course1._id, teacher: teacher1._id, date: dayBefore, status: 'Present' },
      { student: student2._id, course: course1._id, teacher: teacher1._id, date: dayBefore, status: 'Present' },
      { student: student3._id, course: course1._id, teacher: teacher1._id, date: dayBefore, status: 'Absent', remarks: 'Medical leave' },

      { student: student1._id, course: course1._id, teacher: teacher1._id, date: yesterday, status: 'Present' },
      { student: student2._id, course: course1._id, teacher: teacher1._id, date: yesterday, status: 'Late', remarks: '10 mins late' },
      { student: student3._id, course: course1._id, teacher: teacher1._id, date: yesterday, status: 'Present' },

      { student: student1._id, course: course2._id, teacher: teacher2._id, date: today, status: 'Present' },
      { student: student2._id, course: course2._id, teacher: teacher2._id, date: today, status: 'Present' },
      { student: student3._id, course: course2._id, teacher: teacher2._id, date: today, status: 'Present' },
    ]);

    // 6. Seed Marks
    await Marks.create([
      { student: student1._id, course: course1._id, teacher: teacher1._id, examType: 'Midsem', marks: 88, maxMarks: 100, remarks: 'Excellent' },
      { student: student1._id, course: course1._id, teacher: teacher1._id, examType: 'Lab', marks: 95, maxMarks: 100, remarks: 'Great project implementation' },
      { student: student1._id, course: course2._id, teacher: teacher2._id, examType: 'Midsem', marks: 82, maxMarks: 100, remarks: 'Good work' },

      { student: student2._id, course: course1._id, teacher: teacher1._id, examType: 'Midsem', marks: 85, maxMarks: 100, remarks: 'Very Good' },
      { student: student2._id, course: course1._id, teacher: teacher1._id, examType: 'Lab', marks: 92, maxMarks: 100, remarks: 'Solid backend code' },

      { student: student3._id, course: course1._id, teacher: teacher1._id, examType: 'Midsem', marks: 74, maxMarks: 100, remarks: 'Fair' },
    ]);

    // 7. Seed Notifications
    await Notification.create([
      {
        title: 'Welcome to Even Semester 2026',
        message: 'Classes and lab sessions for Computer Engineering 6th Semester have commenced.',
        targetRole: 'All',
        createdBy: adminUser._id,
      },
      {
        title: 'Midsem Examination Schedule Released',
        message: 'Midsem examinations will start from 25th of next month. Check syllabus on portal.',
        targetRole: 'Student',
        createdBy: teacherUser1._id,
      },
      {
        title: 'Lab 04 Submission Notice',
        message: 'Submit the completed MERN stack backend code and ER diagram review by Friday.',
        targetRole: 'Student',
        createdBy: teacherUser1._id,
      },
    ]);

    // 8. Seed Queries
    await Query.create([
      {
        student: student1._id,
        teacher: teacher1._id,
        queryText: 'Sir, what is the best practice for storing JWT tokens and verifying roles in MERN stack?',
        response: 'Store token in localStorage or httpOnly cookie, and attach role-based middleware on backend routes.',
        status: 'Answered',
        answeredAt: new Date(),
      },
      {
        student: student2._id,
        teacher: teacher1._id,
        queryText: 'Sir, do we need to implement batch attendance recording for the whole class?',
        response: '',
        status: 'Pending',
      },
    ]);

    console.log('Database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('Test Credentials:');
    console.log('  Admin:   email: admin@ddu.ac.in, password: admin123');
    console.log('  Teacher: email: vrund@ddu.ac.in, password: teacher123');
    console.log('  Student: email: 24ceuos155@ddu.ac.in, password: student123');
    console.log('  Student: email: 23ceubg010@ddu.ac.in, password: student123');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
