import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  // Expire timer (10 minutes)
  const [expiryTime, setExpiryTime] = useState(600);
  // Cooldown timer (60 seconds)
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      toast.error('Email is missing');
      navigate('/register');
    }
  }, [email, navigate]);

  // Handle countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setExpiryTime((prev) => (prev > 0 ? prev - 1 : 0));
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return toast.error('Please enter a valid 6-digit code');
    }

    setLoading(false);
    try {
      const res = await axios.post('/api/auth/verify-email', { email, otp });
      toast.success(res.data.message || 'Verification successful!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;

    try {
      const res = await axios.post('/api/auth/resend-verification', { email });
      toast.success(res.data.message || 'New verification code sent');
      setExpiryTime(600); // Reset expiry to 10 minutes
      setCooldown(60); // Set cooldown to 60 seconds
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">We sent a 6-digit code to {email}</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="otp">Verification Code</label>
              <input
                type="text"
                id="otp"
                maxLength={6}
                placeholder="123456"
                className="auth-input text-center text-2xl tracking-widest font-bold"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
              <span>Code expires in: <strong className={expiryTime === 0 ? 'text-red-500' : ''}>{formatTime(expiryTime)}</strong></span>
              {expiryTime === 0 && <span className="text-red-500 font-semibold">Expired</span>}
            </div>

            <button type="submit" className="auth-button" disabled={loading || expiryTime === 0}>
              Verify
            </button>
          </form>

          <div className="auth-footer mt-4">
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className={`text-logo-purple font-semibold hover:underline ${cooldown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
