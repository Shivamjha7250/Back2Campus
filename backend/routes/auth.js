// File: backend/routes/auth.js
import express from 'express';
import {
    register,
    login,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    getMe // ✅ Naya function import karein
} from '../controllers/authController.js';
import auth from '../middleware/auth.js'; // Auth middleware import karein

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// ✅ Naya Protected Route: Logged-in user ki details ke liye
// Yeh route /api/auth/me par request handle karega
router.get('/me', auth, getMe);

export default router;
