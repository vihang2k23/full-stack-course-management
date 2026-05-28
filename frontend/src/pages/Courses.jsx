// Courses page — create/edit/delete user's own courses with image upload.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses';
import * as authApi from '../api/auth';

const emptyForm = { courseName: '', courseDuration: '', courseFees: '' };

// Extract filename from stored path for display in the edit form
const fileNameFromPath = (imagePath) => {
  if (!imagePath) return '';
  const parts = imagePath.split('/');
  return parts[parts.length - 1] || '';
};

const formatFees = (fees) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(fees);

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [existingImageFileName, setExistingImageFileName] = useState('');
  const [selectedImageFileName, setSelectedImageFileName] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await coursesApi.getCourses();
      setCourses(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const loadDashboard = async () => {
    setDashboardMsg('');
    try {
      const data =
        user.role === 'admin'
          ? await authApi.getAdminDashboard()
          : await authApi.getUserDashboard();
      setDashboardMsg(data.message);
    } catch (err) {
      setDashboardMsg(err.message);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setSelectedImageFileName('');
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview('');
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setSelectedImageFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetImageState = () => {
    setImageFile(null);
    setSelectedImageFileName('');
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview('');
    setExistingImage('');
    setExistingImageFileName('');
    setFileInputKey((k) => k + 1);
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append('courseName', form.courseName);
    formData.append('courseDuration', form.courseDuration);
    formData.append('courseFees', form.courseFees);
    if (imageFile) {
      formData.append('image', imageFile);
    }
    return formData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!editId && !imageFile) {
      setError('Please select a course image');
      return;
    }

    const formData = buildFormData();
    setSubmitting(true);

    try {
      if (editId) {
        await coursesApi.updateCourse(editId, formData);
      } else {
        await coursesApi.createCourse(formData);
      }
      setForm(emptyForm);
      setEditId(null);
      resetImageState();
      loadCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (course) => {
    setEditId(course._id);
    setForm({
      courseName: course.courseName,
      courseDuration: course.courseDuration,
      courseFees: String(course.courseFees),
    });
    setImageFile(null);
    setSelectedImageFileName('');
    setImagePreview('');
    setExistingImage(course.image || '');
    setExistingImageFileName(fileNameFromPath(course.image));
    setFileInputKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await coursesApi.deleteCourse(id);
      loadCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm(emptyForm);
    resetImageState();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My courses</h1>
          <p className="page-subtitle">
            Hi {user.name} — create and manage courses that belong only to your account.
          </p>
        </div>
        <button type="button" className="btn secondary btn-sm" onClick={loadDashboard}>
          Test dashboard API
        </button>
      </div>

      {dashboardMsg && <p className="success">{dashboardMsg}</p>}
      {error && <p className="error">{error}</p>}

      <div className="courses-layout">
        <form
          className="card form form-card"
          encType="multipart/form-data"
          onSubmit={handleSubmit}
        >
          <h2>{editId ? 'Edit course' : 'Add new course'}</h2>

          <label>
            Course name
            <input
              name="courseName"
              value={form.courseName}
              onChange={handleChange}
              placeholder="e.g. Full Stack Development"
              required
            />
          </label>
          <label>
            Duration
            <input
              name="courseDuration"
              value={form.courseDuration}
              onChange={handleChange}
              placeholder="e.g. 6 months"
              required
            />
          </label>
          <label>
            Fees (USD)
            <input
              type="number"
              name="courseFees"
              value={form.courseFees}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </label>

          <div className="file-field">
            <span className="file-field-label">Course image</span>
            <input
              ref={fileInputRef}
              key={`${editId || 'new'}-${fileInputKey}`}
              className="file-input-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required={!editId && !imageFile}
            />
            <div className="file-drop-zone">
              <p className="hint" style={{ marginBottom: '0.75rem' }}>
                JPEG, PNG or WebP
              </p>
              <button
                type="button"
                className="btn secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {imageFile || (editId && existingImage) ? 'Change image' : 'Choose image'}
              </button>
              {editId && existingImageFileName && !imageFile && (
                <p className="file-name-tag" style={{ marginTop: '0.75rem' }} title={existingImageFileName}>
                  Current: {existingImageFileName}
                </p>
              )}
              {selectedImageFileName && imageFile && (
                <p className="file-name-tag" style={{ marginTop: '0.75rem' }} title={selectedImageFileName}>
                  Selected: {selectedImageFileName}
                </p>
              )}
            </div>
          </div>

          {editId && existingImage && !imagePreview && (
            <div className="image-preview-block">
              <p className="hint">Current image</p>
              <img
                className="course-thumb-lg"
                src={coursesApi.courseImageUrl(existingImage)}
                alt="Current course"
              />
            </div>
          )}
          {imagePreview && (
            <div className="image-preview-block">
              <p className="hint">{editId ? 'New preview' : 'Preview'}</p>
              <img className="course-thumb-lg" src={imagePreview} alt="Selected course" />
            </div>
          )}
          {editId && !imageFile && (
            <p className="hint">Leave image empty to keep the current picture.</p>
          )}

          <div className="row">
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? 'Saving...' : editId ? 'Update course' : 'Create course'}
            </button>
            {editId && (
              <button type="button" className="btn secondary" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="card">
          <div className="card-header">
            <h2>Your catalog</h2>
            <span className="course-count">{courses.length} courses</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <span className="spinner" aria-hidden />
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden>
                📚
              </div>
              <p>No courses yet</p>
              <p className="hint">Use the form to add your first course.</p>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <article key={course._id} className="course-card">
                  {course.image ? (
                    <img
                      className="course-card-image"
                      src={coursesApi.courseImageUrl(course.image)}
                      alt={course.courseName}
                    />
                  ) : (
                    <div className="course-card-image placeholder" aria-hidden>
                      📷
                    </div>
                  )}
                  <div className="course-card-body">
                    <h3>{course.courseName}</h3>
                    <div className="course-meta">
                      <span>⏱ {course.courseDuration}</span>
                      <span className="course-fees">{formatFees(course.courseFees)}</span>
                    </div>
                    <div className="course-card-actions">
                      <button
                        type="button"
                        className="btn secondary btn-sm"
                        onClick={() => handleEdit(course)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn danger btn-sm"
                        onClick={() => handleDelete(course._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
