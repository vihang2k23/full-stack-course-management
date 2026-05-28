// Set new password — final step after OTP verification
import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';

export default function ResetPassword() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const linkToken = searchParams.get('token') || sessionStorage.getItem('resetLinkToken');

  const resetJwt =
    location.state?.resetToken ||
    searchParams.get('resetToken') ||
    sessionStorage.getItem('resetToken');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resetJwt) {
      sessionStorage.setItem('resetToken', resetJwt);
    }
  }, [resetJwt]);

  if (!resetJwt && linkToken) {
    return <Navigate to={`/verify-otp?token=${linkToken}`} replace />;
  }

  if (!resetJwt) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="card">
            <p className="error">Session expired. Verify OTP again.</p>
            <Link to="/forgot-password" className="btn">
              Forgot password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword({ resetToken: resetJwt, password });
      sessionStorage.removeItem('resetToken');
      sessionStorage.removeItem('resetLinkToken');
      setSuccess(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="card" style={{ textAlign: 'center' }}>
            <p className="success">{success}</p>
            <p className="hint">Login with your new password.</p>
            <Link to="/login" className="btn">
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>New password</h1>
        <p className="auth-lead">You have 1 hour after OTP verification to set a new password</p>
        <form className="card form" onSubmit={handleSubmit}>
          {error && <p className="error">{error}</p>}
          <label>
            New password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              minLength={8}
              required
            />
          </label>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
}
