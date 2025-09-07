import React, { useState } from 'react';
import LogoHeader from '../components/LogoHeader';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../pages/apiConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess('OTP sent to your email!');
      setTimeout(() => {
        navigate('/otp-verification', {
          state: {
            userId: data.userId,
            email,
            redirect: '/reset-password',
          },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/*  Back2Campus Logo Header at Top */}
      <LogoHeader />

      {/*  Centered Forgot Password Form */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-600 mb-4">Forgot Password</h2>

          {error && <p className="text-sm text-center text-red-500 mb-4">{error}</p>}
          {success && <p className="text-sm text-center text-green-500 mb-4">{success}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold disabled:bg-blue-400"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
