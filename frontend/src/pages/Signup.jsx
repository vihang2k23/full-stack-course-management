// Signup page — multipart form with required profile photo
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signupUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview('');
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please choose a profile image');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('role', form.role);
      formData.append('image', imageFile);

      const data = await signup(formData);
      signupUser(data);
      navigate('/courses');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p className="auth-lead">Add a profile photo and start managing your courses</p>
        <form className="card form" encType="multipart/form-data" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}

          <div className="file-field">
            <span className="file-field-label">Profile photo</span>
            <input
              ref={fileInputRef}
              className="file-input-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              required
            />
            <div className="file-drop-zone signup-avatar-zone">
              {imagePreview ? (
                <img className="signup-avatar-preview" src={imagePreview} alt="Profile preview" />
              ) : (
                <p className="hint">JPEG, PNG or WebP — max 5MB</p>
              )}
              <button
                type="button"
                className="btn secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? 'Change photo' : 'Choose photo'}
              </button>
            </div>
          </div>

          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </label>
          <label>
            Role
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
