import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { MessageSquareQuote, Send, CheckCircle, Clock } from 'lucide-react';

const Queries = () => {
  const { role, profile } = useAuth();
  const [queries, setQueries] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student New Query State
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [queryText, setQueryText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState('');

  // Teacher Response State
  const [responses, setResponses] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/queries');
      if (res.data.success) {
        setQueries(res.data.queries);
      }
    } catch (err) {
      console.error('Error fetching queries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      if (res.data.success) {
        setTeachers(res.data.teachers);
        if (res.data.teachers.length > 0) {
          setSelectedTeacher(res.data.teachers[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching teachers for query:', err);
    }
  };

  useEffect(() => {
    fetchQueries();
    if (role === 'Student') {
      fetchTeachers();
    }
  }, [role]);

  // Student Submit
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/queries', {
        teacherId: selectedTeacher,
        queryText,
      });

      if (res.data.success) {
        setNotification('Your doubt has been submitted to the faculty!');
        setQueryText('');
        fetchQueries();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit query.');
    } finally {
      setSubmitting(false);
    }
  };

  // Teacher Respond
  const handleTeacherRespond = async (queryId) => {
    const responseText = responses[queryId];
    if (!responseText || !responseText.trim()) {
      alert('Please type a response.');
      return;
    }

    setReplyingId(queryId);
    try {
      const res = await api.put(`/queries/${queryId}/respond`, {
        response: responseText,
      });
      if (res.data.success) {
        setNotification('Response submitted successfully!');
        setResponses({ ...responses, [queryId]: '' });
        fetchQueries();
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert('Failed to submit response.');
    } finally {
      setReplyingId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Student-Faculty Doubt Desk</h2>
          <p>Direct academic discussion and question resolution platform</p>
        </div>
      </div>

      {notification && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* STUDENT ASK DOUBT FORM */}
      {role === 'Student' && (
        <div className="card mb-4">
          <div className="card-header">
            <h3>Ask a Doubt to Faculty</h3>
          </div>
          <form onSubmit={handleStudentSubmit} className="query-form">
            <div className="form-group">
              <label>Select Professor / Faculty Member</label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                required
              >
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.user?.name} - {t.department} ({t.designation})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Describe Your Question / Doubt</label>
              <textarea
                rows="3"
                placeholder="Type your question or academic inquiry in detail here..."
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !queryText.trim()}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Doubt'}</span>
            </button>
          </form>
        </div>
      )}

      {/* QUERIES LIST */}
      <div className="card">
        <div className="card-header">
          <h3>
            {role === 'Student' && 'My Submitted Doubts'}
            {role === 'Teacher' && 'Student Questions & Inquiries'}
            {role === 'Admin' && 'All Academic Inquiries'}
          </h3>
        </div>

        {loading ? (
          <div className="loading-state">Loading doubts...</div>
        ) : (
          <div className="queries-list">
            {queries.length > 0 ? (
              queries.map((q) => {
                const isPending = q.status === 'Pending';
                const canRespond =
                  role === 'Teacher' &&
                  profile &&
                  (q.teacher?._id === profile._id || q.teacher === profile._id);

                return (
                  <div key={q._id} className="query-card">
                    <div className="query-header">
                      <div className="query-user-info">
                        <strong>Student: {q.student?.user?.name || 'Student'}</strong>
                        <span className="query-target">
                          → To: {q.teacher?.user?.name || 'Faculty Member'}
                        </span>
                      </div>
                      <div className="query-status-badge">
                        {isPending ? (
                          <span className="badge badge-warning">
                            <Clock size={12} /> Pending
                          </span>
                        ) : (
                          <span className="badge badge-present">
                            <CheckCircle size={12} /> Answered
                          </span>
                        )}
                        <span className="query-date">
                          {new Date(q.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="query-question">
                      <p>
                        <strong>Q:</strong> {q.queryText}
                      </p>
                    </div>

                    {/* Faculty Answer */}
                    {q.response ? (
                      <div className="query-response">
                        <p>
                          <strong>Faculty Answer:</strong> {q.response}
                        </p>
                        <span className="response-date">
                          Answered on: {new Date(q.answeredAt || q.date).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      canRespond && (
                        <div className="query-reply-box">
                          <textarea
                            rows="2"
                            placeholder="Type your answer for this student..."
                            value={responses[q._id] || ''}
                            onChange={(e) =>
                              setResponses({ ...responses, [q._id]: e.target.value })
                            }
                          ></textarea>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary mt-2"
                            disabled={replyingId === q._id}
                            onClick={() => handleTeacherRespond(q._id)}
                          >
                            <Send size={14} />
                            <span>{replyingId === q._id ? 'Sending...' : 'Send Answer'}</span>
                          </button>
                        </div>
                      )
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center py-5">No doubts or queries found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Queries;
