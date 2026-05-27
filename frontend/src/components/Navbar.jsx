import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isLoggedIn, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        Course Manager
      </Link>
      <div className="nav-links">
        <Link to="/courses">Courses</Link>
        {isLoggedIn ? (
          <>
            <span className="user-badge">
              {user.name} ({user.role})
            </span>
            <button type="button" onClick={handleLogout}>
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
