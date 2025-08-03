// File: frontend/src/services/authService.js

import API_URL from '../pages/apiConfig'; // ✅ Correct import

const AUTH_API_URL = `${API_URL}/api/auth`; // ✅ Use imported variable

// A helper function to handle API responses
const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'An error occurred.');
    }
    return data;
};

// --- AUTHENTICATION API CALLS ---

export const registerUser = (userData) => {
    return fetch(`${AUTH_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
    }).then(handleResponse);
};

export const loginUser = (email, password) => {
    return fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    }).then(handleResponse);
};

export const verifyUserOtp = (email, otp) => {
    return fetch(`${AUTH_API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
    }).then(handleResponse);
};

export const resendUserOtp = (email) => {
    return fetch(`${AUTH_API_URL}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    }).then(handleResponse);
};

export const forgotPassword = (email) => {
    return fetch(`${AUTH_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    }).then(handleResponse);
};

export const resetPassword = (email, otp, newPassword) => {
    return fetch(`${AUTH_API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
    }).then(handleResponse);
};
