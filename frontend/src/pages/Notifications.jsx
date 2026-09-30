import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Trash2, X, CheckCircle, Calendar } from 'lucide-react';

const Notifications = () => {
  const { role } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRole: 'All',
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

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/notifications', formData);
      if (res.data.success) {
        setNotificationMsg('Announcement published successfully!');
        setIsModalOpen(false);
        setFormData({ title: '', message: '', targetRole: 'All' });
        fetchNotifications();
        setTimeout(() => setNotificationMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish notice.');
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
      alert('Failed to delete announcement.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Campus Circulars & Notices</h2>
          <p>Official announcements, exam schedules, and academic updates</p>
        </div>
        {role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Publish Notice</span>
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
                    </div>
                  </div>
                  {role === 'Admin' && (
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

      {/* Publish Notice Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Publish Campus Notice</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNotification} className="modal-form">
              <div className="form-group">
                <label>Notice Headline / Subject *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Sessional-1 Examination Schedule"
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
                  <option value="All">All (Students & Faculty)</option>
                  <option value="Student">Students Only</option>
                  <option value="Teacher">Faculty Only</option>
                </select>
              </div>

              <div className="form-group">
                <label>Notice Content *</label>
                <textarea
                  rows="4"
                  name="message"
                  placeholder="Enter detailed notice content or instructions..."
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
                  {submitting ? 'Publishing...' : 'Publish Notice'}
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
