import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from './apiConfig';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || 'your.email@example.com';

    useEffect(() => {
        if (!email) navigate('/login');
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [email, navigate]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            if (data.token) {
                localStorage.setItem('token', data.token);
                navigate('/home');
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Account</h2>
                <p className="text-gray-600 mb-6">
                    Enter OTP sent to <br />
                    <span className="font-semibold text-gray-800">{email}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label htmlFor="otp" className="sr-only">OTP</label>
                        <input
                            id="otp"
                            type="text"
                            maxLength="6"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-4 py-3 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-center text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="mt-6 text-sm">
                    {canResend ? (
                        <button className="font-medium text-blue-600 hover:underline">
                            Resend OTP
                        </button>
                    ) : (
                        <p className="text-gray-500">
                            Resend OTP in {formatTime(timer)}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationPage;