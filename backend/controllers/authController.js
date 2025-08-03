// File: backend/controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// Helper function to generate a JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper function to generate a 6-digit OTP
const generateOtp = () => crypto.randomInt(100000, 999999).toString();


// ✅ Naya Function: Logged-in user ki details paane ke liye
export const getMe = async (req, res) => {
    try {
        // req.user.id auth middleware se aata hai
        const user = await User.findById(req.user.id).select('-password'); // Password ko chhodkar baki sab bhejein
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error("Get Me Error:", error);
        res.status(500).json({ message: 'Server error while fetching user details.' });
    }
};


// 1. Register a new user
export const register = async (req, res) => {
    const { firstName, lastName, email, password, userType } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists and is verified.' });
        }
        if (user && !user.isVerified) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.password = password;
            user.userType = userType;
        } else {
            user = new User({ firstName, lastName, email, password, userType });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(email, 'Verify Your Back2Campus Account', `Your verification OTP is: ${otp}`);
        res.status(201).json({ message: 'OTP sent to your email. Please verify to complete registration.' });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// 2. Login a user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        if (!user.isVerified) {
            return res.status(403).json({ message: 'Account is not verified. Please check your email.' });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(email, 'Your Login OTP', `Your login OTP is: ${otp}`);
        res.status(200).json({ message: 'OTP sent to your email for login.' });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// 3. Verify OTP for registration or login
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        const wasAlreadyVerified = user.isVerified;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        if (wasAlreadyVerified) {
            res.status(200).json({
                _id: user._id,
                token: generateToken(user._id),
                message: 'Login successful!'
            });
        } else {
            res.status(200).json({ message: 'Account verified successfully. Please log in.' });
        }
    } catch (error) {
        console.error("Verify OTP Error:", error);
        res.status(500).json({ message: 'Server error during OTP verification.' });
    }
};

// 4. Resend OTP for account verification
export const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "This email is not registered." });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: "This account is already verified." });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(email, 'New Verification OTP', `Your new OTP is: ${otp}`);
        res.status(200).json({ message: "A new OTP has been sent to your email." });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error while resending OTP." });
    }
};

// 5. Forgot Password - Send OTP
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "This email is not registered." });
        }
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        await sendEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);
        res.status(200).json({ message: 'Password reset OTP sent to your email.' });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

// 6. Reset Password with OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ 
            email, 
            otp, 
            otpExpires: { $gt: Date.now() } 
        });
        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};
