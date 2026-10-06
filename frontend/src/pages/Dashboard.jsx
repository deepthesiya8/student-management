import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, role, profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        let endpoint = '';
        if (role === 'Admin') endpoint = '/dashboard/admin';
        else if (role === 'Teacher') endpoint = '/dashboard/teacher';
        else if (role === 'Student') endpoint = '/dashboard/student';

        if (endpoint) {
          const res = await api.get(endpoint);
          if (res.data.success) {
            setData(res.data);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  if (loading) {
    return <div className="loading-state">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="alert-box error">{error}</div>;
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <h1>Welcome, {user?.name}! 👋</h1>
          <p className="subtitle">
            {role === 'Admin' && 'System Administrator Portal • Dharmsinh Desai University'}
            {role === 'Teacher' && `${profile?.designation || 'Faculty'} • Department of ${profile?.department || 'CE'}`}
            {role === 'Student' && `Student ID: ${profile?.studentId || 'N/A'} • Semester ${profile?.semester || 1} (${profile?.department || 'CE'})`}
          </p>
        </div>
      </div>

      {/* ADMIN DASHBOARD */}
      {role === 'Admin' && data && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon icon-blue">
                <GraduationCap size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Total Students</span>
                <h3 className="stat-number">{data.stats?.totalStudents || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-green">
                <Users size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Faculty Members</span>
                <h3 className="stat-number">{data.stats?.totalTeachers || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-purple">
                <BookOpen size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Active Courses</span>
                <h3 className="stat-number">{data.stats?.totalCourses || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-orange">
                <TrendingUp size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Overall Attendance</span>
                <h3 className="stat-number">{data.stats?.overallAttendanceRate || 0}%</h3>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="card mt-4">
            <div className="card-header">
              <h3>Quick Management Shortcuts</h3>
            </div>
            <div className="quick-actions-grid">
              <Link to="/students" className="action-button">
                <GraduationCap size={20} />
                <span>Manage Students</span>
              </Link>
              <Link to="/teachers" className="action-button">
                <Users size={20} />
                <span>Manage Teachers</span>
              </Link>
              <Link to="/courses" className="action-button">
                <BookOpen size={20} />
                <span>Course Catalog</span>
              </Link>
              <Link to="/notifications" className="action-button">
                <Bell size={20} />
                <span>Post Announcement</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* TEACHER DASHBOARD */}
      {role === 'Teacher' && data && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon icon-purple">
                <BookOpen size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Assigned Courses</span>
                <h3 className="stat-number">{data.stats?.assignedCoursesCount || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-orange">
                <MessageSquareQuote size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Pending Student Doubts</span>
                <h3 className="stat-number">{data.stats?.pendingQueriesCount || 0}</h3>
              </div>
            </div>
          </div>

          {/* Assigned Courses List */}
          <div className="card mt-4">
            <div className="card-header">
              <h3>My Assigned Courses</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to="/notifications" className="btn btn-sm btn-outline">
                  <Bell size={15} style={{ marginRight: '4px' }} /> Post Announcement
                </Link>
                <Link to="/attendance" className="btn btn-sm btn-primary">Take Attendance</Link>
              </div>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Name</th>
                    <th>Dept & Sem</th>
                    <th>Credits</th>
                    <th>Enrolled Students</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignedCourses && data.assignedCourses.length > 0 ? (
                    data.assignedCourses.map((c) => (
                      <tr key={c._id}>
                        <td><span className="code-pill">{c.courseCode}</span></td>
                        <td><strong>{c.courseName}</strong></td>
                        <td>{c.department} - Sem {c.semester}</td>
                        <td>{c.credits}</td>
                        <td>{c.enrolledStudents?.length || 0} Students</td>
                        <td>
                          <div className="action-cell">
                            <Link to="/attendance" className="btn-link">Attendance</Link>
                            <Link to="/marks" className="btn-link">Marks</Link>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">No courses assigned yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT DASHBOARD */}
      {role === 'Student' && data && (
        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon icon-purple">
                <BookOpen size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Enrolled Courses</span>
                <h3 className="stat-number">{data.enrolledCoursesCount || 0}</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-green">
                <CalendarCheck size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Attendance Percentage</span>
                <h3 className="stat-number">{data.attendanceSummary?.attendancePercentage || 0}%</h3>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon icon-blue">
                <Award size={28} />
              </div>
              <div className="stat-details">
                <span className="stat-label">Present Sessions</span>
                <h3 className="stat-number">
                  {data.attendanceSummary?.presentCount || 0} / {data.attendanceSummary?.totalAttendance || 0}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid-2 mt-4">
            {/* Recent Marks */}
            <div className="card">
              <div className="card-header">
                <h3>Recent Marks</h3>
                <Link to="/marks" className="btn-link">View All</Link>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Exam</th>
                      <th>Marks</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentMarks && data.recentMarks.length > 0 ? (
                      data.recentMarks.map((m) => (
                        <tr key={m._id}>
                          <td>{m.course?.courseName || 'Course'}</td>
                          <td>{m.examType}</td>
                          <td>{m.marks} / {m.maxMarks}</td>
                          <td><span className="grade-badge">{m.grade}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4">No marks recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Announcements */}
            <div className="card">
              <div className="card-header">
                <h3>Latest Announcements</h3>
                <Link to="/notifications" className="btn-link">View All</Link>
              </div>
              <div className="announcements-list">
                {data.notifications && data.notifications.length > 0 ? (
                  data.notifications.map((n) => (
                    <div key={n._id} className="announcement-item">
                      <div className="announcement-icon">
                        <Bell size={18} />
                      </div>
                      <div className="announcement-body">
                        <h4>{n.title}</h4>
                        <p>{n.message}</p>
                        <span className="announcement-date">
                          {new Date(n.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4">No announcements available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
