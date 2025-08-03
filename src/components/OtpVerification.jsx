import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../apiConfig';

const OtpVerificationPage = () => {
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendMessage, setResendMessage] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }

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
        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed.');

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

    const handleResend = async () => {
        if (!canResend) return;

        setResendMessage('Sending new OTP...');
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to resend.');

            setTimer(120);
            setCanResend(false);
            setResendMessage('A new OTP has been sent.');
        } catch (err) {
            setError(err.message);
            setResendMessage('');
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    Enter OTP sent to <br />
                    <span className="text-gray-900 font-semibold">{email}</span>
                </p>

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="------"
                        className="w-full px-4 py-3 border-2 border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-2xl text-center tracking-widest rounded-md"
                        required
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {resendMessage && <p className="text-green-500 text-sm">{resendMessage}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md transition disabled:bg-blue-400"
                    >
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>
                </form>

                <div className="mt-6 text-sm text-gray-500">
                    {canResend ? (
                        <button onClick={handleResend} className="text-blue-600 hover:underline font-medium">
                            Resend OTP
                        </button>
                    ) : (
                        <p>Resend OTP in {formatTime(timer)}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationPage;
