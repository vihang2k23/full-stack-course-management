/** Profile page — change display name and profile photo */
import { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { uploadImageUrl } from '../api/uploads';

/** Fallback letters when no profile image is set */
const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user?.name || '');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const currentImage = user?.image ? uploadImageUrl(user.image) : '';

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
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!imageFile) {
      setError('Please choose a new profile photo');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('image', imageFile);

    setLoading(true);
    try {
      const data = await updateProfile(formData);
      updateUser(data.user);
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview('');
      setSuccess(data.message || 'Profile updated');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow">
      <h1>My profile</h1>
      <p className="page-subtitle">Update your photo and display name</p>

      <div className="card profile-card">
        <div className="profile-current">
          {currentImage && !imagePreview ? (
            <img className="profile-avatar-lg" src={currentImage} alt={user.name} />
          ) : imagePreview ? (
            <img className="profile-avatar-lg" src={imagePreview} alt="New preview" />
          ) : (
            <span className="profile-avatar-lg profile-avatar-fallback">
              {getInitials(user?.name)}
            </span>
          )}
          <div className="profile-info">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Role:</strong>{' '}
              <span className={`role-pill ${user?.role}`}>{user?.role}</span>
            </p>
          </div>
        </div>

        <form className="form" encType="multipart/form-data" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <label>
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              minLength={2}
              required
            />
          </label>

          <div className="file-field">
            <span className="file-field-label">New profile photo</span>
            <input
              ref={fileInputRef}
              className="file-input-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            <div className="file-drop-zone signup-avatar-zone">
              <button
                type="button"
                className="btn secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? 'Change selection' : 'Choose new photo'}
              </button>
              {imageFile && (
                <p className="hint" style={{ marginTop: '0.5rem' }}>
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
