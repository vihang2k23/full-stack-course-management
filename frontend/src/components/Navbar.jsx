/**
 * Top navigation — brand links, profile avatar (links to /profile), logout.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadImageUrl } from '../api/uploads.js';

/** Fallback letters when no profile image is available */
const getInitials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

export default function Navbar() {
  const { user, isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const profileImage = user?.image ? uploadImageUrl(user.image) : '';
  const showPhoto = profileImage && !imageError;

  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Course Manager
      </Link>
      <div className="nav-links">
        {isLoggedIn && <Link to="/courses">My Courses</Link>}
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="nav-profile" title="Edit profile">
              {showPhoto ? (
                <img
                  className="nav-avatar"
                  src={profileImage}
                  alt={`${user.name} profile`}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span className="nav-avatar nav-avatar-fallback" aria-hidden>
                  {getInitials(user.name)}
                </span>
              )}
              <span className="nav-profile-name">{user.name}</span>
              <span className={`role-pill ${user.role}`}>{user.role}</span>
            </Link>
            <button type="button" className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}
