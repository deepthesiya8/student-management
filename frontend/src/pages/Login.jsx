import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  // Quick 1-click helper for Viva / Demo
  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-icon-box">
            <GraduationCap size={40} className="login-brand-icon" />
          </div>
          <h1>Student Management System</h1>
          <p>Dharmsinh Desai University (DDU)</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert-box error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. 24ceuos155@ddu.ac.in"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.88rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
            Register here
          </Link>
        </div>

        {/* Quick Demo Credentials Box for Viva */}
        <div className="demo-credentials-section">
          <p className="demo-title">⚡ Quick Viva Demo Accounts (1-Click Fill):</p>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn demo-admin"
              onClick={() => handleQuickLogin('admin@ddu.ac.in', 'admin123')}
            >
              Admin
            </button>
            <button
              type="button"
              className="demo-btn demo-teacher"
              onClick={() => handleQuickLogin('vrund@ddu.ac.in', 'teacher123')}
            >
              Teacher
            </button>
            <button
              type="button"
              className="demo-btn demo-student"
              onClick={() => handleQuickLogin('24ceuos155@ddu.ac.in', 'student123')}
            >
              Student
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
