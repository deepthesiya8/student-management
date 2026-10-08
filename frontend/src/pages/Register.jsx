import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Phone,
  BookOpen,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Award,
} from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('Student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNo: '',
    studentId: '',
    teacherId: '',
    department: 'Computer Engineering',
    semester: 1,
    designation: '',
    qualification: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    setRole(selectedRole);
    setError('');
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, email: '', password: '' }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const result = await register({ ...formData, role });
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-box">
            <GraduationCap size={40} className="login-brand-icon" />
          </div>
          <h1>Create New Account</h1>
          <p>Dharmsinh Desai University (DDU) Portal</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="role-selector-tabs">
          <button
            type="button"
            className={`role-tab ${role === 'Student' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Student')}
          >
            <GraduationCap size={18} />
            <span>Student</span>
          </button>
          <button
            type="button"
            className={`role-tab ${role === 'Teacher' ? 'active' : ''}`}
            onClick={() => handleRoleChange('Teacher')}
          >
            <Briefcase size={18} />
            <span>Faculty / Teacher</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {/* Hidden inputs to divert aggressive browser autofill */}
          <input type="text" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <div className="form-group">
            <label>Full Name *</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={role === 'Teacher' ? 'e.g. Prof. Faculty / Teacher Name' : 'e.g. Deep Thesiya'}
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder={role === 'Teacher' ? 'teacher@ddu.ac.in' : 'student@ddu.ac.in'}
                  autoComplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Mobile Number</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon" />
                <input
                  type="text"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  placeholder="10-digit mobile"
                />
              </div>
            </div>

            {role === 'Student' ? (
              <div className="form-group">
                <label>Student Roll / ID *</label>
                <div className="input-with-icon">
                  <BookOpen size={18} className="input-icon" />
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="e.g. 24CEUOS155"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label>Teacher ID *</label>
                <div className="input-with-icon">
                  <Briefcase size={18} className="input-icon" />
                  <input
                    type="text"
                    name="teacherId"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    placeholder="e.g. TCH-CE-01"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              >
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            {role === 'Student' ? (
              <div className="form-group">
                <label>Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label>Designation</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  placeholder="e.g. Assistant Professor"
                />
              </div>
            )}
          </div>

          {role === 'Teacher' && (
            <div className="form-group">
              <label>Academic Qualification</label>
              <div className="input-with-icon">
                <Award size={18} className="input-icon" />
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  placeholder="e.g. Ph.D / M.Tech / B.Tech"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block mt-2" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : `Register as ${role}`}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: '#64748b' }}>
          Already registered?{' '}
          <Link to="/login" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
