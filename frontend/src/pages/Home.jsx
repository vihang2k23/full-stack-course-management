import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="page">
      <h1>Course Management</h1>
      <p>Manage courses with login, signup, and protected API routes.</p>

      {isLoggedIn ? (
        <div className="card">
          <p>
            Logged in as <strong>{user.name}</strong> ({user.role})
          </p>
          <Link to="/courses" className="btn">
            Go to Courses
          </Link>
        </div>
      ) : (
        <div className="card row">
          <Link to="/login" className="btn">
            Login
          </Link>
          <Link to="/signup" className="btn secondary">
            Signup
          </Link>
        </div>
      )}
    </div>
  );
}
