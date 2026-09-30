import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  MessageSquareQuote,
  Bell,
} from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <GraduationCap size={32} className="logo-icon" />
        <div className="logo-text">
          <h3>SMS Portal</h3>
          <p>MERN System</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {/* Dashboard is common for everyone */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        {/* Admin Links */}
        {role === 'Admin' && (
          <>
            <div className="nav-group-title">ADMINISTRATION</div>
            <NavLink
              to="/students"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <GraduationCap size={20} />
              <span>Students</span>
            </NavLink>
            <NavLink
              to="/teachers"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Users size={20} />
              <span>Teachers</span>
            </NavLink>
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <BookOpen size={20} />
              <span>Courses</span>
            </NavLink>
          </>
        )}

        {/* Teacher Links */}
        {role === 'Teacher' && (
          <>
            <div className="nav-group-title">ACADEMICS</div>
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <BookOpen size={20} />
              <span>My Courses</span>
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <CalendarCheck size={20} />
              <span>Take Attendance</span>
            </NavLink>
            <NavLink
              to="/marks"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Award size={20} />
              <span>Enter Marks</span>
            </NavLink>
            <NavLink
              to="/queries"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <MessageSquareQuote size={20} />
              <span>Student Doubts</span>
            </NavLink>
          </>
        )}

        {/* Student Links */}
        {role === 'Student' && (
          <>
            <div className="nav-group-title">STUDENT PORTAL</div>
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <BookOpen size={20} />
              <span>Enrolled Courses</span>
            </NavLink>
            <NavLink
              to="/attendance"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <CalendarCheck size={20} />
              <span>My Attendance</span>
            </NavLink>
            <NavLink
              to="/marks"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Award size={20} />
              <span>Marks & Grades</span>
            </NavLink>
            <NavLink
              to="/queries"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <MessageSquareQuote size={20} />
              <span>Ask Doubt</span>
            </NavLink>
          </>
        )}

        {/* Common Notices / Announcements */}
        <div className="nav-group-title">COMMUNICATION</div>
        <NavLink
          to="/notifications"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <Bell size={20} />
          <span>Announcements</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
