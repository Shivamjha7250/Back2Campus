// File: backend/controllers/userController.js
import User from '../models/User.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Upload or Change Profile Picture (More Robust Version with Debugging)
export const uploadProfilePicture = async (req, res) => {
    // ✅ DEBUGGING LOGS
    console.log("--- uploadProfilePicture function called ---");
    console.log("User ID from token:", req.user.id);
    console.log("File received on server:", req.file);

    try {
        if (!req.file) {
            console.error("Error: No file was attached to the request.");
            return res.status(400).json({ message: 'No file was uploaded.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            console.error("Error: User not found with ID:", req.user.id);
            return res.status(404).json({ message: 'User not found.' });
        }
        console.log("User found in DB:", user.email);

        // Agar user.profile object nahi hai, to use banayein
        if (!user.profile) {
            console.log("User profile object did not exist. Creating one now.");
            user.profile = {};
        }

        // Agar purani photo hai to use delete karein
        if (user.profile.avatar) {
            console.log("Existing avatar found. Attempting to delete:", user.profile.avatar);
            const oldPath = path.join(__dirname, '..', user.profile.avatar);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
                console.log("Old avatar file deleted successfully.");
            }
        }

        // Nayi photo ka path save karein
        const newAvatarUrl = `/uploads/${req.file.filename}`;
        console.log("Setting new avatar URL in profile:", newAvatarUrl);
        user.profile.avatar = newAvatarUrl;
        
        console.log("Attempting to save the user document...");
        await user.save();
        console.log("User document saved successfully.");

        res.status(200).json({ 
            message: 'Profile picture updated successfully.',
            avatarUrl: newAvatarUrl 
        });

    } catch (error) {
        console.error("!!! CRITICAL ERROR in uploadProfilePicture:", error);
        res.status(500).json({ message: 'Server error while uploading photo.' });
    }
};

// 2. Remove Profile Picture
export const removeProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.profile && user.profile.avatar) {
            const oldPath = path.join(__dirname, '..', user.profile.avatar);
             if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        // ✅ Badlav: Mongoose ke .set() method ka istemal karein
        user.set('profile.avatar', '');
        await user.save();
        
        res.status(200).json({ message: 'Profile picture removed successfully.' });
    } catch (error) {
        console.error("Remove Photo Error:", error);
        res.status(500).json({ message: 'Server error while removing photo.' });
    }
};

// 3. Get a single user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otp');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) { 
        res.status(500).json({ message: 'Server error' }); 
    }
};

// 4. Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -otp');
        res.json(users);
    } catch (error) { 
        res.status(500).json({ message: 'Server error' }); 
    }
};
