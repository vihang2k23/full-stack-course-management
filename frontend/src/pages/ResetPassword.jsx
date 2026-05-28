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
      <div className="page narrow">
        <p className="error">Session expired. Verify OTP again.</p>
        <Link to="/forgot-password">Forgot password</Link>
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
      <div className="page narrow">
        <div className="card">
          <p className="success">{success}</p>
          <p>Login with your new password.</p>
          <Link to="/login" className="btn">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h1>Reset password</h1>
      <p className="hint">You have 1 hour after OTP verification to set a new password.</p>
      <form className="card form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            minLength={8}
            required
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}
