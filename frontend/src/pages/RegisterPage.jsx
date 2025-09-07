import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE_URL from '../pages/apiConfig';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: 'Student',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      navigate('/otp-verification', {
        state: {
          userId: data.userId,
          email: form.email,
          redirect: '/login',
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-900">Create Account</h2>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
            <div className="flex border border-gray-300 rounded-md p-1">
              <button
                type="button"
                onClick={() => setForm({ ...form, userType: 'Student' })}
                className={`w-1/2 py-2 rounded ${form.userType === 'Student' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, userType: 'Alumni' })}
                className={`w-1/2 py-2 rounded ${form.userType === 'Alumni' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                Alumni
              </button>
            </div>
          </div>

          {/* Input Fields */}
          <input
            name="firstName"
            type="text"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="lastName"
            type="text"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm text-blue-600"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
