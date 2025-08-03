// File: backend/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    // Jise notification milega
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Jisne notification bheja
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Notification ka prakar
    type: {
        type: String,
        enum: ['like', 'comment', 'request_accepted', 'request_rejected'],
        required: true,
    },
    // Jis post se sambandhit hai (optional)
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    // Kya notification padh liya gaya hai
    read: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
