import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

const formatUserType = (type) =>
  type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();


export const register = async (req, res) => {
  const { firstName, lastName, email, password, userType } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const otp = generateOtp();
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      userType: formatUserType(userType),
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
      isVerified: false,
    });
    await user.save();
    await sendEmail(email, 'OTP for Registration', `Your OTP is: ${otp}`);
    res.status(201).json({ message: 'OTP sent for registration', userId: user._id });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const verifyOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = generateToken(user._id);
    res.status(200).json({
      message: 'OTP verified successfully',
      token,
      user: {
        _id: user._id, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        userType: user.userType,
        profile: user.profile, 
      },
    });
  } catch (error) {
    console.error('OTP Verify Error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
};

export const resendOtp = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendEmail(user.email, 'Resent OTP', `Your new OTP is: ${otp}`);
    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resending OTP' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendEmail(email, 'OTP for Login', `Your OTP is: ${otp}`);
    res.status(200).json({
      message: 'OTP sent for login',
      userId: user._id,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'Email not registered' });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();
    await sendEmail(email, 'OTP for Password Reset', `Your OTP is: ${otp}`);
    res.status(200).json({ message: 'OTP sent to email', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error during forgot password' });
  }
};


export const resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const user = await User.findById(userId).select('+password');
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset Error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};