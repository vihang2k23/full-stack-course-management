/** Landing page — hero and links to login, signup, or courses */
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { uploadImageUrl } from '../api/uploads.js';

export default function Home() {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="page">
      <section className="hero">
        <h1>Learn. Teach. Manage courses.</h1>
        <p>
          A full-stack course platform with secure auth, per-user courses, image uploads, and
          password reset via email.
        </p>

        {isLoggedIn ? (
          <div className="card welcome-card" style={{ maxWidth: 420, margin: '0 auto' }}>
            {user.image && (
              <img
                className="signup-avatar-preview"
                src={uploadImageUrl(user.image)}
                alt={user.name}
              />
            )}
            <p>
              Welcome back, <strong>{user.name}</strong>
            </p>
            <span className={`role-pill ${user.role}`}>{user.role}</span>
            <Link to="/courses" className="btn">
              Go to my courses
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/login" className="btn">
              Login
            </Link>
            <Link to="/signup" className="btn secondary">
              Create account
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
