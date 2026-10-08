import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, CheckCircle, XCircle, AlertTriangle, Save, Users } from 'lucide-react';

const Attendance = () => {
  const { role, profile } = useAuth();

  // Teacher State
  const [teacherCourses, setTeacherCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [studentsList, setStudentsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Student State
  const [studentSummary, setStudentSummary] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);

  // Initial load for teacher
  useEffect(() => {
    if (role === 'Teacher' || role === 'Admin') {
      const fetchCourses = async () => {
        try {
          const res = await api.get('/courses');
          if (res.data.success) {
            let filtered = res.data.courses;
            if (role === 'Teacher' && profile) {
              filtered = res.data.courses.filter(
                (c) => c.teacher?._id === profile._id || c.teacher === profile._id
              );
            }
            setTeacherCourses(filtered);
            if (filtered.length > 0) {
              setSelectedCourse(filtered[0]._id);
            }
          }
        } catch (err) {
          console.error('Error fetching courses for attendance:', err);
        }
      };
      fetchCourses();
    }
  }, [role, profile]);

  // Load students for selected course (Teacher) and prefill attendance if taken on this date
  useEffect(() => {
    if ((role === 'Teacher' || role === 'Admin') && selectedCourse) {
      const course = teacherCourses.find((c) => c._id === selectedCourse);
      if (course && course.enrolledStudents) {
        // Build initial attendance state
        const initialList = course.enrolledStudents
          .filter(Boolean)
          .map((s) => ({
            studentId: typeof s === 'object' && s._id ? s._id : s,
            studentCode: typeof s === 'object' && s.studentId ? s.studentId : (typeof s === 'string' ? s : 'N/A'),
            name: typeof s === 'object' && s.user?.name ? s.user.name : (typeof s === 'object' && s.name ? s.name : 'Student'),
            status: 'Present',
            remarks: '',
          }));

        // Fetch existing attendance for this course to prefill if already recorded for attendanceDate
        api.get(`/attendance/course/${selectedCourse}`)
          .then((res) => {
            if (res.data.success && res.data.attendance) {
              const targetDateStr = attendanceDate;
              const matchingRecords = res.data.attendance.filter((rec) => {
                const recDate = new Date(rec.date).toISOString().split('T')[0];
                return recDate === targetDateStr;
              });

              if (matchingRecords.length > 0) {
                const updatedList = initialList.map((item) => {
                  const existing = matchingRecords.find(
                    (rec) => (rec.student?._id || rec.student) === item.studentId
                  );
                  if (existing) {
                    return {
                      ...item,
                      status: existing.status,
                      remarks: existing.remarks || '',
                    };
                  }
                  return item;
                });
                setStudentsList(updatedList);
                return;
              }
            }
            setStudentsList(initialList);
          })
          .catch(() => {
            setStudentsList(initialList);
          });
      }
    }
  }, [selectedCourse, teacherCourses, attendanceDate]);

  // Load attendance data for Student
  useEffect(() => {
    if (role === 'Student' && profile?._id) {
      const fetchStudentAttendance = async () => {
        setStudentLoading(true);
        try {
          const res = await api.get(`/attendance/student/${profile._id}`);
          if (res.data.success) {
            const rawRecords = res.data.records || [];
            // Filter out any records with missing course
            const records = rawRecords.filter((r) => r.course != null);
            const summary = res.data.attendanceSummary || res.data.summary || {};

            const total = summary.totalAttendance ?? summary.totalClasses ?? records.length;
            const present = summary.presentCount ?? summary.presentClasses ?? records.filter((r) => r.status === 'Present').length;
            const pct = summary.attendancePercentage ?? summary.percentage ?? (total > 0 ? Number(((present / total) * 100).toFixed(2)) : 100);

            setStudentSummary({
              ...summary,
              totalAttendance: total,
              presentCount: present,
              attendancePercentage: pct,
            });
            setAttendanceRecords(records.length > 0 ? records : rawRecords);
          }
        } catch (err) {
          console.error('Error fetching student attendance:', err);
        } finally {
          setStudentLoading(false);
        }
      };
      fetchStudentAttendance();
    }
  }, [role, profile]);

  // Teacher handlers
  const handleStatusToggle = (index, status) => {
    const updated = [...studentsList];
    updated[index].status = status;
    setStudentsList(updated);
  };


  const handleSaveAttendance = async () => {
    if (!selectedCourse) {
      alert('Please select a course.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourse,
        date: attendanceDate,
        records: studentsList.map((s) => ({
          studentId: s.studentId,
          status: s.status,
          remarks: s.remarks,
        })),
      };

      const res = await api.post('/attendance', payload);
      if (res.data.success) {
        setNotification('Attendance submitted successfully!');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Attendance Management</h2>
          <p>Daily lecture attendance tracking and session verification</p>
        </div>
      </div>

      {notification && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {/* TEACHER OR ADMIN VIEW */}
      {(role === 'Teacher' || role === 'Admin') && (
        <div className="attendance-teacher-view">
          {/* Controls Bar */}
          <div className="card">
            <div className="attendance-controls-row">
              <div className="form-group flex-1">
                <label>Select Course / Subject</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {teacherCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date of Lecture</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                />
              </div>


            </div>
          </div>

          {/* Student Roster Table */}
          <div className="card mt-4">
            <div className="card-header">
              <h3>
                Class Attendance Sheet ({studentsList.length} Students)
              </h3>
              <button
                className="btn btn-primary"
                onClick={handleSaveAttendance}
                disabled={saving || studentsList.length === 0}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Submit Attendance'}</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll / Student ID</th>
                    <th>Student Name</th>
                    <th>Attendance Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.length > 0 ? (
                    studentsList.map((stu, idx) => (
                      <tr key={stu.studentId}>
                        <td><span className="code-pill">{stu.studentCode || 'N/A'}</span></td>
                        <td><strong>{stu.name}</strong></td>
                        <td>
                          <div className="status-toggle-group">
                            <button
                              type="button"
                              className={`toggle-btn present ${
                                stu.status === 'Present' ? 'active' : ''
                              }`}
                              onClick={() => handleStatusToggle(idx, 'Present')}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              className={`toggle-btn absent ${
                                stu.status === 'Absent' ? 'active' : ''
                              }`}
                              onClick={() => handleStatusToggle(idx, 'Absent')}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Optional note"
                            className="remarks-input"
                            value={stu.remarks}
                            onChange={(e) => {
                              const updated = [...studentsList];
                              updated[idx].remarks = e.target.value;
                              setStudentsList(updated);
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No enrolled students found for this course. Please enroll students first.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT VIEW */}
      {role === 'Student' && (
        <div className="attendance-student-view">
          {studentLoading ? (
            <div className="loading-state">Loading attendance records...</div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon icon-blue">
                    <CalendarCheck size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Total Conducted Lectures</span>
                    <h3 className="stat-number">{studentSummary?.totalAttendance || 0}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-green">
                    <CheckCircle size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Lectures Attended</span>
                    <h3 className="stat-number">{studentSummary?.presentCount || 0}</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-orange">
                    <CalendarCheck size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Overall Percentage</span>
                    <h3 className="stat-number">
                      {studentSummary?.attendancePercentage || 0}%
                    </h3>
                  </div>
                </div>
              </div>

              {/* 75% Rule Alert */}
              {studentSummary && studentSummary.attendancePercentage < 75 && (
                <div className="alert-box warning mt-4">
                  <AlertTriangle size={20} />
                  <div>
                    <strong>Warning: Low Attendance!</strong> Your overall attendance is below
                    the mandatory 75% criteria required to appear in final semester examinations.
                  </div>
                </div>
              )}

              {/* Attendance Log Table */}
              <div className="card mt-4">
                <div className="card-header">
                  <h3>Lecture-wise Attendance Log</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.length > 0 ? (
                        attendanceRecords.map((r) => (
                          <tr key={r._id}>
                            <td>{new Date(r.date).toLocaleDateString()}</td>
                            <td><span className="code-pill">{r.course?.courseCode || 'N/A'}</span></td>
                            <td>{r.course?.courseName || 'Course'}</td>
                            <td>
                              <span
                                className={`badge ${
                                  r.status === 'Present' ? 'badge-present' : 'badge-absent'
                                }`}
                              >
                                {r.status}
                              </span>
                            </td>
                            <td>{r.remarks || '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-4">
                            No attendance logs recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
