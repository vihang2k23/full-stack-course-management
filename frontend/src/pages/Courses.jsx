import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses';
import * as authApi from '../api/auth';
const emptyForm = { courseName: '', courseDuration: '', courseFees: '' };

const fileNameFromPath = (imagePath) => {
  if (!imagePath) return '';
  const parts = imagePath.split('/');
  return parts[parts.length - 1] || '';
};

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
        <h1>Courses</h1>
        <button type="button" className="btn secondary" onClick={loadDashboard}>
          Check dashboard API
        </button>
      </div>

      {dashboardMsg && <p className="success">{dashboardMsg}</p>}
      {error && <p className="error">{error}</p>}

      <form className="card form" encType="multipart/form-data" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit course' : 'Add course'}</h2>
        <p className="hint">
          Course data is saved in Atlas (database <strong>test</strong>, collection{' '}
          <strong>courses</strong>). The image file stays on this server; Atlas stores only the
          path in the <code>image</code> field.
        </p>
        <label>
          Course name
          <input name="courseName" value={form.courseName} onChange={handleChange} required />
        </label>
        <label>
          Duration
          <input
            name="courseDuration"
            value={form.courseDuration}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Fees
          <input
            type="number"
            name="courseFees"
            value={form.courseFees}
            onChange={handleChange}
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
          <div className="file-field-row">
            <button
              type="button"
              className="btn secondary file-choose-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              {imageFile || (editId && existingImage) ? 'Change image' : 'Choose image'}
            </button>
            {editId && existingImageFileName && !imageFile && (
              <span className="file-name-tag" title={existingImageFileName}>
                Current: {existingImageFileName}
              </span>
            )}
            {editId && selectedImageFileName && imageFile && (
              <span className="file-name-tag" title={selectedImageFileName}>
                New: {selectedImageFileName}
              </span>
            )}
          </div>
        </div>
        {editId && existingImage && !imagePreview && (
          <div className="image-preview-block">
            <p className="hint">Current image</p>
            <img
              className="course-thumb"
              src={coursesApi.courseImageUrl(existingImage)}
              alt="Current course"
            />
          </div>
        )}
        {imagePreview && (
          <div className="image-preview-block">
            <p className="hint">{editId ? 'New image preview' : 'Preview'}</p>
            <img className="course-thumb" src={imagePreview} alt="Selected course" />
          </div>
        )}
        {editId && !imageFile && (
          <p className="hint">Leave image empty to keep the current picture.</p>
        )}
        <div className="row">
          <button type="submit" className="btn">
            {editId ? 'Update' : 'Create'}
          </button>
          {editId && (
            <button type="button" className="btn secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="card">
        <h2>All courses ({courses.length})</h2>
        {loading ? (
          <p>Loading...</p>
        ) : courses.length === 0 ? (
          <p>No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Duration</th>
                <th>Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>
                    {course.image ? (
                      <img
                        className="course-thumb"
                        src={coursesApi.courseImageUrl(course.image)}
                        alt={course.courseName}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{course.courseName}</td>
                  <td>{course.courseDuration}</td>
                  <td>{course.courseFees}</td>
                  <td className="row">
                    <button type="button" onClick={() => handleEdit(course)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(course._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
