// File: backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // ✅ Badlav: 'student' aur 'alumni' (chote अक्षरों mein) ko bhi allow kiya gaya hai
    userType: { 
        type: String, 
        enum: ['Student', 'Alumni', 'student', 'alumni'], 
        default: 'Student' 
    },
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    profile: {
        avatar: { type: String, default: '' },
        education: [{
            institution: String,
            degree: String,
            field: String,
        }],
        internship: String,
    },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Password matching method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
