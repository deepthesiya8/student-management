import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Plus,
  Trash2,
  X,
  CheckCircle,
  Calendar,
  User,
  Sparkles,
  FlaskConical,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';

const Notifications = () => {
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: role === 'Teacher' ? 'Student' : 'All',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      message: '',
      targetRole: role === 'Teacher' ? 'Student' : 'All',
    });
    setIsModalOpen(true);
  };

  // Quick 1-click preset templates (especially useful for teachers like Extra Lab, Deadlines)
  const applyTemplate = (type) => {
    if (type === 'extraLab') {
      setFormData({
        title: 'Extra Lab Session Notice - Computer Engineering',
        message:
          'Dear Students, please note that an extra lab session is scheduled for tomorrow at 10:00 AM in Lab 304. Attendance is compulsory, please bring your completed journals.',
        targetRole: 'Student',
      });
    } else if (type === 'assignment') {
      setFormData({
        title: 'Assignment Submission Deadline Reminder',
        message:
          'All students are required to submit Assignment 2 on the portal by this Friday, 5:00 PM. Late submissions will result in marks deduction.',
        targetRole: 'Student',
      });
    } else if (type === 'quiz') {
      setFormData({
        title: 'Class Quiz / Midsem Assessment Notice',
        message:
          'A short 20-minute assessment test/quiz covering recent topics will be conducted in tomorrow’s lecture class. Please be present on time.',
        targetRole: 'Student',
      });
    } else if (type === 'reschedule') {
      setFormData({
        title: 'Lecture Timing Rescheduled Notice',
        message:
          'Tomorrow morning’s lecture has been rescheduled to 2:30 PM in Room 204 due to faculty academic duties. Please inform your classmates.',
        targetRole: 'Student',
      });
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/notifications', formData);
      if (res.data.success) {
        setNotificationMsg(
          role === 'Teacher'
            ? 'Class announcement published successfully!'
            : 'Campus notice published successfully!'
        );
        setIsModalOpen(false);
        setFormData({ title: '', message: '', targetRole: role === 'Teacher' ? 'Student' : 'All' });
        fetchNotifications();
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        setNotificationMsg('Announcement removed.');
        fetchNotifications();
        setTimeout(() => setNotificationMsg(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete announcement.');
    }
  };

  const canDeleteNotification = (n) => {
    if (role === 'Admin') return true;
    if (role === 'Teacher') {
      const creatorId = n.createdBy?._id || n.createdBy;
      return (
        creatorId === user?._id ||
        creatorId === user?.id ||
        (n.createdBy?.email && n.createdBy.email === user?.email)
      );
    }
    return false;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Campus Circulars & Announcements</h2>
          <p>Official notices, exam schedules, extra lab sessions, and academic updates</p>
        </div>
        {(role === 'Admin' || role === 'Teacher') && (
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <Plus size={18} />
            <span>{role === 'Teacher' ? 'Post Class Announcement' : 'Publish Notice'}</span>
          </button>
        )}
      </div>

      {notificationMsg && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{notificationMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading announcements...</div>
      ) : (
        <div className="announcements-container mt-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n._id} className="notice-card">
                <div className="notice-header">
                  <div className="notice-icon-box">
                    <Bell size={22} className="notice-bell" />
                  </div>
                  <div className="notice-main-heading">
                    <h3>{n.title}</h3>
                    <div className="notice-tags">
                      <span className="notice-role-tag">Target: {n.targetRole}</span>
                      <span className="notice-date-tag">
                        <Calendar size={13} /> {new Date(n.date).toLocaleDateString()}
                      </span>
                      {n.createdBy && (
                        <span className="notice-author-tag">
                          <User size={13} /> Posted by:{' '}
                          {n.createdBy.name || 'Faculty Member'}{' '}
                          {n.createdBy.role === 'Teacher' ? '(Faculty)' : `(${n.createdBy.role})`}
                        </span>
                      )}
                    </div>
                  </div>
                  {canDeleteNotification(n) && (
                    <button
                      className="btn-icon danger"
                      title="Delete Announcement"
                      onClick={() => handleDeleteNotification(n._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <div className="notice-body">
                  <p>{n.message}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="card text-center py-5">
              <p>No circulars or notices available at this moment.</p>
            </div>
          )}
        </div>
      )}

      {/* Publish Notice / Post Announcement Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                {role === 'Teacher'
                  ? '📢 Post Class / Academic Announcement'
                  : 'Publish Campus Notice'}
              </h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateNotification} className="modal-form">
              {/* Quick Template Shortcuts for Teachers */}
              {role === 'Teacher' && (
                <div className="quick-templates-box">
                  <div className="quick-templates-title">
                    <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Quick Templates (Click to Auto-fill):
                  </div>
                  <div className="quick-templates-bar">
                    <button
                      type="button"
                      className="quick-template-btn"
                      onClick={() => applyTemplate('extraLab')}
                    >
                      <FlaskConical size={14} /> Extra Lab Tomorrow
                    </button>
                    <button
                      type="button"
                      className="quick-template-btn"
                      onClick={() => applyTemplate('assignment')}
                    >
                      <FileText size={14} /> Assignment Deadline
                    </button>
                    <button
                      type="button"
                      className="quick-template-btn"
                      onClick={() => applyTemplate('quiz')}
                    >
                      <HelpCircle size={14} /> Class Quiz / Test
                    </button>
                    <button
                      type="button"
                      className="quick-template-btn"
                      onClick={() => applyTemplate('reschedule')}
                    >
                      <Clock size={14} /> Reschedule Lecture
                    </button>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Notice Headline / Subject *</label>
                <input
                  type="text"
                  name="title"
                  placeholder={
                    role === 'Teacher'
                      ? 'e.g. Extra Lab Tomorrow for CE Sem 4 / DAA Journal Submission'
                      : 'e.g. Sessional-1 Examination Schedule'
                  }
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Audience</label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                >
                  {role === 'Teacher' ? (
                    <>
                      <option value="Student">Students Only (Recommended)</option>
                      <option value="All">All (Students & Faculty)</option>
                    </>
                  ) : (
                    <>
                      <option value="All">All (Students & Faculty)</option>
                      <option value="Student">Students Only</option>
                      <option value="Teacher">Faculty Only</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Notice Content *</label>
                <textarea
                  rows="4"
                  name="message"
                  placeholder={
                    role === 'Teacher'
                      ? 'e.g. Dear students, please note that an extra lab session is scheduled for tomorrow at 10:00 AM in Lab 304. Attendance is mandatory.'
                      : 'Enter detailed notice content or instructions...'
                  }
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
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
                  {submitting
                    ? 'Publishing...'
                    : role === 'Teacher'
                    ? 'Post Announcement'
                    : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
