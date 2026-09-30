import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'Admin':
        return 'badge-admin';
      case 'Teacher':
        return 'badge-teacher';
      case 'Student':
        return 'badge-student';
      default:
        return '';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h2>DDU Student Portal</h2>
      </div>

      <div className="navbar-right">
        {/* User Info & Role Badge */}
        <div className="user-profile-info">
          <UserCircle size={28} className="profile-icon" />
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className={`role-badge ${getRoleBadgeClass()}`}>{role}</span>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} className="logout-btn" title="Logout">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
