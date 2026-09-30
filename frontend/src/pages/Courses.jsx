import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, BookOpen, User, CheckCircle, X, Users, Trash2, Eye, Calendar, Award, UserPlus, Search } from 'lucide-react';

const Courses = () => {
  const { role, profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState('');

  // Course Details Modal State
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Enroll Students State (Admin)
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [courseToEnroll, setCourseToEnroll] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Engineering',
    semester: 6,
    credits: 4,
    teacher: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/teachers');
      if (res.data.success) {
        setTeachers(res.data.teachers);
      }
    } catch (err) {
      console.error('Error fetching teachers for course assignment:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
    if (role === 'Admin') {
      fetchTeachers();
    }
  }, [role]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/courses', formData);
      if (res.data.success) {
        setNotification('Course created successfully!');
        setIsModalOpen(false);
        setFormData({
          courseCode: '',
          courseName: '',
          department: 'Computer Engineering',
          semester: 6,
          credits: 4,
          teacher: '',
        });
        fetchCourses();
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create course.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Course (Admin only)
  const handleDeleteCourse = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete course "${name}"?`)) return;
    try {
      const res = await api.delete(`/courses/${id}`);
      if (res.data.success) {
        setNotification(`Course "${name}" deleted successfully.`);
        if (detailsModalOpen) setDetailsModalOpen(false);
        fetchCourses();
        setTimeout(() => setNotification(''), 3500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  // View Course Details Modal
  const handleViewDetails = async (course) => {
    setLoadingDetails(true);
    setDetailsModalOpen(true);
    try {
      const res = await api.get(`/courses/${course._id}`);
      if (res.data.success) {
        setSelectedCourseDetails(res.data.course);
      } else {
        setSelectedCourseDetails(course);
      }
    } catch (err) {
      setSelectedCourseDetails(course);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Enroll Modal
  const handleOpenEnrollModal = async (course) => {
    setCourseToEnroll(course);
    setEnrollModalOpen(true);
    setStudentSearch('');

    const currentlyEnrolledIds = (course.enrolledStudents || [])
      .map((s) => (typeof s === 'object' && s?._id ? s._id : s))
      .filter(Boolean);
    setSelectedStudentIds(currentlyEnrolledIds);

    // Fetch students list
    setLoadingStudents(true);
    try {
      const res = await api.get('/students');
      if (res.data.success) {
        setAllStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students for enrollment:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Toggle student selection
  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Toggle select all filtered
  const handleSelectAll = (filteredStudents) => {
    const filteredIds = filteredStudents.map((s) => s._id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Save student enrollments
  const handleSaveEnrollment = async () => {
    if (!courseToEnroll) return;
    setEnrolling(true);
    try {
      const res = await api.post(`/courses/${courseToEnroll._id}/assign-students`, {
        studentIds: selectedStudentIds,
        replace: true,
      });
      if (res.data.success) {
        setNotification(`Successfully updated students for ${courseToEnroll.courseName}! (${selectedStudentIds.length} enrolled)`);
        setEnrollModalOpen(false);
        fetchCourses();
        if (detailsModalOpen && selectedCourseDetails?._id === courseToEnroll._id) {
          setSelectedCourseDetails(res.data.course);
        }
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll students.');
    } finally {
      setEnrolling(false);
    }
  };

  // Remove single student from course
  const handleRemoveStudentFromCourse = async (courseId, studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove "${studentName}" from this course?`)) return;
    try {
      const res = await api.post(`/courses/${courseId}/remove-student`, { studentId });
      if (res.data.success) {
        setNotification(`Removed student from course.`);
        fetchCourses();
        if (selectedCourseDetails?._id === courseId) {
          setSelectedCourseDetails(res.data.course);
        }
        setTimeout(() => setNotification(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove student.');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Courses Curriculum</h2>
          <p>Academic subjects, syllabus credits, and faculty allocations</p>
        </div>
        {role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Course</span>
          </button>
        )}
      </div>

      {notification && (
        <div className="alert-box success">
          <CheckCircle size={18} />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading courses curriculum...</div>
      ) : (
        <div className="courses-grid mt-4">
          {courses.length > 0 ? (
            courses.map((course) => {
              const isAssignedToMe =
                role === 'Teacher' &&
                profile &&
                (course.teacher?._id === profile._id || course.teacher === profile._id);

              const isEnrolled =
                role === 'Student' &&
                profile &&
                course.enrolledStudents?.some(
                  (s) => (s._id || s) === profile._id
                );

              return (
                <div
                  key={course._id}
                  className={`course-card ${isAssignedToMe ? 'highlight-course' : ''}`}
                >
                  <div className="course-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="code-pill">{course.courseCode}</span>
                      <span className="credits-badge">{course.credits} Credits</span>
                    </div>
                  </div>

                  <h3 className="course-title">{course.courseName}</h3>

                  <div className="course-meta">
                    <p className="course-dept">
                      {course.department} • Semester {course.semester}
                    </p>
                  </div>

                  <div className="course-footer">
                    <div className="course-teacher">
                      <User size={16} />
                      <span>{course.teacher?.user?.name || 'Faculty Assigned'}</span>
                    </div>
                    <div className="course-students-count">
                      <Users size={16} />
                      <span>{course.enrolledStudents?.length || 0} Enrolled</span>
                    </div>
                  </div>

                  {isAssignedToMe && (
                    <div className="my-course-badge">
                      ✓ Your Assigned Subject
                    </div>
                  )}

                  {isEnrolled && (
                    <div className="enrolled-badge">
                      ✓ Enrolled
                    </div>
                  )}

                  {/* Actions for Course Card */}
                  <div className="course-card-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline flex-1"
                      onClick={() => handleViewDetails(course)}
                    >
                      <Eye size={14} />
                      <span>View Details</span>
                    </button>
                    {role === 'Admin' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleOpenEnrollModal(course)}
                          title="Enroll / Manage Students"
                        >
                          <UserPlus size={14} />
                          <span>Enroll</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCourse(course._id, course.courseName)}
                          title="Delete Course"
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card text-center py-5 col-span-full">
              <p>No courses found in the syllabus.</p>
            </div>
          )}
        </div>
      )}

      {/* Course Details Modal */}
      {detailsModalOpen && selectedCourseDetails && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <h3>{selectedCourseDetails.courseName}</h3>
                <span className="code-pill">{selectedCourseDetails.courseCode}</span>
              </div>
              <button className="modal-close" onClick={() => setDetailsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {loadingDetails ? (
                <div className="loading-state">Loading course details...</div>
              ) : (
                <>
                  <div className="stats-grid mb-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="stat-card" style={{ padding: '14px' }}>
                      <div className="stat-details">
                        <span className="stat-label">Department</span>
                        <strong style={{ fontSize: '0.95rem' }}>{selectedCourseDetails.department}</strong>
                      </div>
                    </div>
                    <div className="stat-card" style={{ padding: '14px' }}>
                      <div className="stat-details">
                        <span className="stat-label">Academic Semester</span>
                        <strong style={{ fontSize: '0.95rem' }}>Semester {selectedCourseDetails.semester}</strong>
                      </div>
                    </div>
                    <div className="stat-card" style={{ padding: '14px' }}>
                      <div className="stat-details">
                        <span className="stat-label">Syllabus Credits</span>
                        <strong style={{ fontSize: '0.95rem' }}>{selectedCourseDetails.credits} Credits</strong>
                      </div>
                    </div>
                    <div className="stat-card" style={{ padding: '14px' }}>
                      <div className="stat-details">
                        <span className="stat-label">Assigned Faculty</span>
                        <strong style={{ fontSize: '0.95rem' }}>
                          {selectedCourseDetails.teacher?.user?.name || 'Not Assigned'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Students Section */}
                  <div className="card" style={{ padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div className="card-header" style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                        Enrolled Students ({selectedCourseDetails.enrolledStudents?.length || 0})
                      </h4>
                      {role === 'Admin' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleOpenEnrollModal(selectedCourseDetails)}
                        >
                          <UserPlus size={14} />
                          <span>+ Manage Students</span>
                        </button>
                      )}
                    </div>
                    {selectedCourseDetails.enrolledStudents && selectedCourseDetails.enrolledStudents.length > 0 ? (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <table className="data-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th>Roll / Student ID</th>
                              <th>Name</th>
                              {role === 'Admin' && <th style={{ textAlign: 'right' }}>Action</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {selectedCourseDetails.enrolledStudents.map((stu, i) => {
                              const sId = stu._id || stu;
                              const sName = stu.user?.name || stu.name || 'Enrolled Student';
                              return (
                                <tr key={sId || i}>
                                  <td><span className="code-pill">{stu.studentId || 'N/A'}</span></td>
                                  <td>{sName}</td>
                                  {role === 'Admin' && (
                                    <td style={{ textAlign: 'right' }}>
                                      <button
                                        type="button"
                                        className="btn-icon danger"
                                        title="Remove from course"
                                        style={{ padding: '3px 6px', display: 'inline-flex', alignItems: 'center' }}
                                        onClick={() => handleRemoveStudentFromCourse(selectedCourseDetails._id, sId, sName)}
                                      >
                                        <X size={14} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '16px 0' }}>
                        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '10px' }}>
                          No students currently enrolled in this course.
                        </p>
                        {role === 'Admin' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => handleOpenEnrollModal(selectedCourseDetails)}
                          >
                            <UserPlus size={14} />
                            <span>Enroll Students Now</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="modal-actions" style={{ marginTop: '20px' }}>
                    {role === 'Admin' && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => handleDeleteCourse(selectedCourseDetails._id, selectedCourseDetails.courseName)}
                      >
                        <Trash2 size={16} />
                        <span>Delete Course</span>
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setDetailsModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create New Course</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    placeholder="e.g. CE601"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Credits</label>
                  <input
                    type="number"
                    name="credits"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Course Title / Subject Name *</label>
                <input
                  type="text"
                  name="courseName"
                  placeholder="e.g. Full Stack Web Development"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  required
                />
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
              </div>

              <div className="form-group">
                <label>Assign Faculty (Teacher)</label>
                <select
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Faculty --</option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.user?.name} ({t.teacherId}) - {t.department}
                    </option>
                  ))}
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
                  {submitting ? 'Creating Course...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Students Modal (Admin) */}
      {enrollModalOpen && courseToEnroll && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '650px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Enroll Students</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                  Course: <strong>{courseToEnroll.courseCode}</strong> - {courseToEnroll.courseName} (Sem {courseToEnroll.semester})
                </p>
              </div>
              <button className="modal-close" onClick={() => setEnrollModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px 24px', flex: 1, overflowY: 'auto' }}>
              {/* Search and Quick Filters */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search student by name or roll number..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    style={{ width: '100%', paddingLeft: '32px' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline"
                  onClick={() => {
                    const filtered = allStudents.filter((s) => {
                      if (!studentSearch) return true;
                      const q = studentSearch.toLowerCase();
                      return (
                        s.studentId?.toLowerCase().includes(q) ||
                        s.user?.name?.toLowerCase().includes(q) ||
                        s.department?.toLowerCase().includes(q)
                      );
                    });
                    handleSelectAll(filtered);
                  }}
                >
                  Select / Deselect All
                </button>
              </div>

              {loadingStudents ? (
                <div className="loading-state" style={{ padding: '30px' }}>Loading student directory...</div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '0.85rem', color: '#64748b' }}>
                    <span>Total Students: {allStudents.length}</span>
                    <span style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {selectedStudentIds.length} Selected
                    </span>
                  </div>

                  <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    {allStudents.length > 0 ? (
                      allStudents
                        .filter((s) => {
                          if (!studentSearch) return true;
                          const q = studentSearch.toLowerCase();
                          return (
                            s.studentId?.toLowerCase().includes(q) ||
                            s.user?.name?.toLowerCase().includes(q) ||
                            s.department?.toLowerCase().includes(q)
                          );
                        })
                        .map((s) => {
                          const isSelected = selectedStudentIds.includes(s._id);
                          const isSameSem = Number(s.semester) === Number(courseToEnroll.semester);
                          return (
                            <div
                              key={s._id}
                              onClick={() => handleToggleStudent(s._id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#eff6ff' : 'white',
                                transition: 'background-color 0.15s ease',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                              />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                                    {s.user?.name || 'Student'}
                                  </span>
                                  <span className="code-pill" style={{ fontSize: '0.75rem' }}>
                                    {s.studentId}
                                  </span>
                                  {isSameSem && (
                                    <span style={{ fontSize: '0.72rem', backgroundColor: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px' }}>
                                      Sem {s.semester}
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                  {s.department} • {s.user?.email}
                                </span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                        No students found.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions" style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEnrollModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEnrollment}
                disabled={enrolling}
              >
                {enrolling ? 'Saving...' : `Save Enrollment (${selectedStudentIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
