import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Award, Save, CheckCircle, FileText } from 'lucide-react';

const Marks = () => {
  const { role, profile } = useAuth();

  // Teacher State
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [examType, setExamType] = useState('MidSem');
  const [maxMarks, setMaxMarks] = useState(30);
  const [marksList, setMarksList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');

  // Student State
  const [studentMarks, setStudentMarks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);

  // Helper function to calculate Grade preview
  // 90-100: A, 80-89: B, 70-79: C, 60-69: D, 35-59: E, 0-34: F
  const getGradePreview = (obtained, max) => {
    if (obtained === '' || obtained === null || obtained === undefined || !max || isNaN(obtained) || isNaN(max)) return '-';
    const numObtained = Number(obtained);
    const numMax = Number(max);
    if (numMax <= 0) return '-';
    const pct = (numObtained / numMax) * 100;
    if (pct >= 90) return 'A';
    if (pct >= 80) return 'B';
    if (pct >= 70) return 'C';
    if (pct >= 60) return 'D';
    if (pct >= 35) return 'E';
    return 'F';
  };

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
            setCourses(filtered);
            if (filtered.length > 0) {
              setSelectedCourse(filtered[0]._id);
            }
          }
        } catch (err) {
          console.error('Error fetching courses for marks:', err);
        }
      };
      fetchCourses();
    }
  }, [role, profile]);

  // Load students for selected course (Teacher) and pre-fill existing marks if any
  useEffect(() => {
    if ((role === 'Teacher' || role === 'Admin') && selectedCourse) {
      const course = courses.find((c) => c._id === selectedCourse);
      if (course && course.enrolledStudents) {
        const list = course.enrolledStudents
          .filter(Boolean)
          .map((s) => ({
            studentId: typeof s === 'object' && s._id ? s._id : s,
            studentCode: typeof s === 'object' && s.studentId ? s.studentId : (typeof s === 'string' ? s : 'N/A'),
            name: typeof s === 'object' && s.user?.name ? s.user.name : (typeof s === 'object' && s.name ? s.name : 'Student'),
            marks: '',
            remarks: '',
          }));

        // Fetch already submitted marks for this course to pre-fill
        api.get(`/marks/course/${selectedCourse}`)
          .then((res) => {
            if (res.data.success && res.data.marks) {
              const currentExamMarks = res.data.marks.filter((m) => m.examType === examType);
              if (currentExamMarks.length > 0) {
                const updatedList = list.map((item) => {
                  const existing = currentExamMarks.find(
                    (m) => (m.student?._id || m.student) === item.studentId
                  );
                  if (existing) {
                    return {
                      ...item,
                      marks: existing.marks,
                      remarks: existing.remarks || '',
                    };
                  }
                  return item;
                });
                setMarksList(updatedList);
                return;
              }
            }
            setMarksList(list);
          })
          .catch(() => {
            setMarksList(list);
          });
      }
    }
  }, [selectedCourse, courses, examType]);

  // Load marks for Student
  useEffect(() => {
    if (role === 'Student' && profile?._id) {
      const fetchStudentMarks = async () => {
        setStudentLoading(true);
        try {
          const res = await api.get(`/marks/student/${profile._id}`);
          if (res.data.success) {
            setStudentMarks(res.data.marks || []);
            setSummary(res.data.summary || null);
          }
        } catch (err) {
          console.error('Error fetching marks for student:', err);
        } finally {
          setStudentLoading(false);
        }
      };
      fetchStudentMarks();
    }
  }, [role, profile]);

  // Teacher input handlers
  const handleMarksChange = (index, value) => {
    const updated = [...marksList];
    const num = Number(value);
    if (value !== '' && !isNaN(num)) {
      if (num < 0) value = '0';
      if (maxMarks && num > Number(maxMarks)) {
        value = String(maxMarks);
      }
    }
    updated[index].marks = value;
    setMarksList(updated);
  };

  const handleRemarksChange = (index, value) => {
    const updated = [...marksList];
    updated[index].remarks = value;
    setMarksList(updated);
  };

  const handleSaveMarks = async () => {
    if (!selectedCourse) {
      alert('Please select a course.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        courseId: selectedCourse,
        examType,
        marksList: marksList.map((m) => ({
          studentId: m.studentId,
          marks: Number(m.marks) || 0,
          maxMarks: Number(maxMarks) || 100,
          remarks: m.remarks,
        })),
      };

      const res = await api.post('/marks', payload);
      if (res.data.success) {
        setNotification('Marks and grades saved successfully!');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit marks.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Marks & Grade Sheet</h2>
          <p>Grading System: 90-100 (A), 80-89 (B), 70-79 (C), 60-69 (D), 35-59 (E), 0-34 (F)</p>
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
        <div className="marks-teacher-view">
          {/* Controls Bar */}
          <div className="card">
            <div className="attendance-controls-row">
              <div className="form-group flex-1">
                <label>Select Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Evaluation Type</label>
                <select
                  value={examType}
                  onChange={(e) => {
                    setExamType(e.target.value);
                    if (e.target.value === 'MidSem') setMaxMarks(30);
                    else if (e.target.value === 'Lab Exam') setMaxMarks(50);
                    else setMaxMarks(100);
                  }}
                >
                  <option value="MidSem">MidSem Exam</option>
                  <option value="Lab Exam">Practical / Lab Exam</option>
                  <option value="EndSem">EndSem Examination</option>
                </select>
              </div>

              <div className="form-group">
                <label>Max Marks</label>
                <input
                  type="number"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  style={{ width: '100px' }}
                />
              </div>
            </div>
          </div>

          {/* Marks Entry Sheet */}
          <div className="card mt-4">
            <div className="card-header">
              <h3>
                Class Evaluation Sheet ({marksList.length} Students)
              </h3>
              <button
                className="btn btn-primary"
                onClick={handleSaveMarks}
                disabled={saving || marksList.length === 0}
              >
                <Save size={18} />
                <span>{saving ? 'Saving...' : 'Submit & Grade'}</span>
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll / Student ID</th>
                    <th>Student Name</th>
                    <th>Marks Obtained (Max: {maxMarks})</th>
                    <th>Grade Calculated</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {marksList.length > 0 ? (
                    marksList.map((stu, idx) => {
                      const grade = getGradePreview(stu.marks, maxMarks);
                      return (
                        <tr key={stu.studentId}>
                          <td><span className="code-pill">{stu.studentCode || 'N/A'}</span></td>
                          <td><strong>{stu.name}</strong></td>
                          <td>
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              value={stu.marks}
                              placeholder="0"
                              className="marks-input"
                              onChange={(e) => handleMarksChange(idx, e.target.value)}
                            />
                          </td>
                          <td>
                            <span
                              className={`grade-badge ${
                                grade === 'F' || grade === 'FF' ? 'grade-fail' : ''
                              }`}
                            >
                              {grade}
                            </span>
                          </td>
                          <td>
                            <input
                              type="text"
                              placeholder="Feedback / Remarks"
                              className="remarks-input"
                              value={stu.remarks}
                              onChange={(e) => handleRemarksChange(idx, e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No enrolled students found for this course.
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
        <div className="marks-student-view">
          {studentLoading ? (
            <div className="loading-state">Loading your grade sheet...</div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon icon-blue">
                    <Award size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Overall Percentage</span>
                    <h3 className="stat-number">{summary?.overallPercentage || 0}%</h3>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon icon-green">
                    <FileText size={28} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-label">Calculated Grade</span>
                    <h3 className="stat-number">{summary?.overallGrade || 'N/A'}</h3>
                  </div>
                </div>
              </div>

              {/* Marks Table */}
              <div className="card mt-4">
                <div className="card-header">
                  <h3>Subject-wise Evaluation Record</h3>
                </div>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Exam Type</th>
                        <th>Marks Obtained</th>
                        <th>Max Marks</th>
                        <th>Percentage</th>
                        <th>Grade</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentMarks.length > 0 ? (
                        studentMarks.map((m) => {
                          const pct = ((m.marks / m.maxMarks) * 100).toFixed(1);
                          return (
                            <tr key={m._id}>
                              <td><span className="code-pill">{m.course?.courseCode || 'N/A'}</span></td>
                              <td><strong>{m.course?.courseName || 'Course'}</strong></td>
                              <td>{m.examType}</td>
                              <td>{m.marks}</td>
                              <td>{m.maxMarks}</td>
                              <td>{pct}%</td>
                              <td><span className="grade-badge">{m.grade}</span></td>
                              <td>
                                <span
                                  className={`badge ${
                                    m.status === 'Pass' ? 'badge-present' : 'badge-absent'
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center py-4">
                            No marks have been recorded yet for your account.
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

export default Marks;
