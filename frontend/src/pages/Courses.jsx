import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as coursesApi from '../api/courses';
import * as authApi from '../api/auth';

const emptyForm = { courseName: '', courseDuration: '', courseFees: '' };

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const body = {
      ...form,
      courseFees: Number(form.courseFees),
    };

    try {
      if (editId) {
        await coursesApi.updateCourse(editId, body);
      } else {
        await coursesApi.createCourse(body);
      }
      setForm(emptyForm);
      setEditId(null);
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

      <form className="card form" onSubmit={handleSubmit}>
        <h2>{editId ? 'Edit course' : 'Add course'}</h2>
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
                <th>Name</th>
                <th>Duration</th>
                <th>Fees</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
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
