import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { verifyOtp } from '../api/auth';

export default function VerifyOtp() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const linkToken = searchParams.get('token') || sessionStorage.getItem('resetLinkToken') || '';

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linkToken) {
      sessionStorage.setItem('resetLinkToken', linkToken);
    }
  }, [linkToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await verifyOtp({ token: linkToken, otp });
      sessionStorage.setItem('resetToken', data.resetToken);
      sessionStorage.removeItem('resetLinkToken');
      navigate('/reset-password', { state: { resetToken: data.resetToken } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!linkToken) {
    return (
      <div className="page narrow">
        <p className="error">Invalid reset link. Request a new one.</p>
        <Link to="/forgot-password">Forgot password</Link>
      </div>
    );
  }

  return (
    <div className="page narrow">
      <h1>Verify OTP</h1>
      <p>Enter the 6-digit code from your email.</p>
      <form className="card form" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          OTP
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            maxLength={6}
            placeholder="123456"
            required
          />
        </label>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Verifying...' : 'Next'}
        </button>
      </form>
      <p>
        <Link to="/forgot-password">Resend OTP</Link>
      </p>
    </div>
  );
}
