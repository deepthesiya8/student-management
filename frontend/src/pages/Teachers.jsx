import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, X, Users, CheckCircle, Mail, Phone } from 'lucide-react';

const Teachers = () => {
  const { role } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    contactNo: '',
    teacherId: '',
    department: 'Computer Engineering',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const url = department ? `/teachers?department=${encodeURIComponent(department)}` : '/teachers';
      const res = await api.get(url);
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [department]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/teachers', formData);
      if (res.data.success) {
        setNotification('Teacher created successfully!');
        setIsModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          contactNo: '',
          teacherId: '',
          department: 'Computer Engineering',
          designation: 'Assistant Professor',
          qualification: 'M.Tech',
        });
        fetchTeachers();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    if (!window.confirm('Are you sure you want to delete this teacher?')) return;
    try {
      const res = await api.delete(`/teachers/${id}`);
      if (res.data.success) {
        setNotification('Teacher removed successfully.');
        fetchTeachers();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert('Failed to delete teacher.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Faculty & Professors</h2>
          <p>Department faculty directory and academic assignments</p>
        </div>
        {role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Faculty</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter by Department */}
      <div className="filter-card">
        <div className="filter-group">
          <select value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="loading-state">Loading faculty list...</div>
      ) : (
        <div className="teachers-grid mt-4">
          {teachers.length > 0 ? (
            teachers.map((t) => (
              <div key={t._id} className="teacher-card">
                <div className="teacher-card-header">
                  <div className="teacher-avatar">
                    {t.user?.name ? t.user.name.charAt(0) : 'T'}
                  </div>
                  <div className="teacher-main-info">
                    <h4>{t.user?.name || 'Faculty Member'}</h4>
                    <span className="teacher-desig">{t.designation}</span>
                  </div>
                </div>

                <div className="teacher-details-list">
                  <div className="teacher-detail-item">
                    <span className="detail-label">Teacher ID:</span>
                    <span className="code-pill">{t.teacherId}</span>
                  </div>
                  <div className="teacher-detail-item">
                    <span className="detail-label">Department:</span>
                    <span>{t.department}</span>
                  </div>
                  <div className="teacher-detail-item">
                    <span className="detail-label">Qualification:</span>
                    <span>{t.qualification}</span>
                  </div>
                  <div className="teacher-detail-item">
                    <Mail size={14} className="detail-icon" />
                    <span>{t.user?.email || 'N/A'}</span>
                  </div>
                  {t.user?.contactNo && (
                    <div className="teacher-detail-item">
                      <Phone size={14} className="detail-icon" />
                      <span>{t.user.contactNo}</span>
                    </div>
                  )}
                </div>

                {role === 'Admin' && (
                  <div className="teacher-card-footer">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteTeacher(t._id)}
                    >
                      <Trash2 size={14} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card text-center py-5 col-span-full">
              <p>No faculty members found in this department.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Teacher Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Add Faculty Member</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="modal-form">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Prof. Vrund Dobariya"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="e.g. vrund@ddu.ac.in"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Login Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teacher ID *</label>
                  <input
                    type="text"
                    name="teacherId"
                    placeholder="e.g. TCH-CE-01"
                    value={formData.teacherId}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="text"
                    name="contactNo"
                    placeholder="10-digit mobile"
                    value={formData.contactNo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Designation</label>
                  <input
                    type="text"
                    name="designation"
                    placeholder="e.g. Assistant Professor"
                    value={formData.designation}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="e.g. M.Tech (Computer Engineering)"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

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

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Faculty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
