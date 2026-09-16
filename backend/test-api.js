// Automated API Verification Script
const BASE_URL = 'http://127.0.0.1:5000';

async function runTests() {
  console.log('🧪 Starting API Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, extra = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName} ${extra}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extra}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('1. Testing Server Health Check');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'healthy', 'Health Check');

    // 2. Admin Login
    console.log('\n2. Testing Authentication (Admin Login)');
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ddu.ac.in', password: 'admin123' }),
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.token, 'Admin Login Token Received');
    const adminToken = adminData.token;

    // 3. Teacher Login
    console.log('\n3. Testing Authentication (Teacher Login)');
    const teacherLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'vrund@ddu.ac.in', password: 'teacher123' }),
    });
    const teacherData = await teacherLoginRes.json();
    assert(teacherLoginRes.status === 200 && teacherData.token, 'Teacher Login Token Received');
    const teacherToken = teacherData.token;
    const teacherProfileId = teacherData.profile?._id;

    // 4. Student Login
    console.log('\n4. Testing Authentication (Student Login)');
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '24ceuos155@ddu.ac.in', password: 'student123' }),
    });
    const studentData = await studentLoginRes.json();
    assert(studentLoginRes.status === 200 && studentData.token, 'Student Login Token Received');
    const studentToken = studentData.token;
    const studentProfileId = studentData.profile?._id;

    // 5. RBAC Enforcement: Student cannot access Admin Users route
    console.log('\n5. Testing RBAC Security Protection');
    const rbacRes = await fetch(`${BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(rbacRes.status === 403, 'RBAC correctly blocks Student from Admin /api/users');

    // 6. Admin User Management
    console.log('\n6. Testing Admin User List & Search');
    const usersRes = await fetch(`${BASE_URL}/api/users?role=Student`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const usersData = await usersRes.json();
    assert(usersRes.status === 200 && usersData.users.length > 0, 'Admin can fetch filtered users', `(Count: ${usersData.count})`);

    // 7. Course Management
    console.log('\n7. Testing Course Listing');
    const coursesRes = await fetch(`${BASE_URL}/api/courses`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const coursesData = await coursesRes.json();
    assert(coursesRes.status === 200 && coursesData.courses.length > 0, 'Authenticated user can fetch courses', `(Count: ${coursesData.count})`);
    const courseId = coursesData.courses[0]?._id;

    // 8. Attendance Management
    console.log('\n8. Testing Student Attendance History');
    const attRes = await fetch(`${BASE_URL}/api/attendance/student/${studentProfileId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const attData = await attRes.json();
    assert(attRes.status === 200 && attData.summary, 'Fetch student attendance percentage', `(Percentage: ${attData.summary?.percentage}%)`);

    // 9. Marks and Result Calculation
    console.log('\n9. Testing Marks & Result Calculation');
    const marksRes = await fetch(`${BASE_URL}/api/marks/student/${studentProfileId}`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const marksData = await marksRes.json();
    assert(marksRes.status === 200 && marksData.summary?.overallGrade, 'Student result calculated with grade', `(Grade: ${marksData.summary?.overallGrade}, Status: ${marksData.summary?.overallStatus})`);

    // 10. Dashboard Stats (Admin)
    console.log('\n10. Testing Admin Dashboard Statistics');
    const adminDashRes = await fetch(`${BASE_URL}/api/dashboard/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDash = await adminDashRes.json();
    assert(adminDashRes.status === 200 && adminDash.stats?.totalStudents > 0, 'Admin dashboard stats returned', `(Students: ${adminDash.stats?.totalStudents}, Teachers: ${adminDash.stats?.totalTeachers})`);

    // 11. Dashboard Stats (Student)
    console.log('\n11. Testing Student Dashboard Statistics');
    const stuDashRes = await fetch(`${BASE_URL}/api/dashboard/student`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const stuDash = await stuDashRes.json();
    assert(stuDashRes.status === 200 && stuDash.enrolledCoursesCount > 0, 'Student dashboard stats returned', `(Enrolled Courses: ${stuDash.enrolledCoursesCount})`);

    // 12. Notifications
    console.log('\n12. Testing Notifications');
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const notifData = await notifRes.json();
    assert(notifRes.status === 200 && notifData.notifications.length > 0, 'User can read broadcast notifications', `(Count: ${notifData.count})`);

    // 13. Query Management
    console.log('\n13. Testing Query Management');
    const queryRes = await fetch(`${BASE_URL}/api/queries`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const queryData = await queryRes.json();
    assert(queryRes.status === 200 && queryData.queries.length > 0, 'Student can view queries and teacher responses', `(Count: ${queryData.count})`);

    console.log('\n========================================');
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

runTests();
