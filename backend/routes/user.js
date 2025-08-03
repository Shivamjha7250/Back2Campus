// File: backend/routes/user.js
import express from 'express';
import {
    uploadProfilePicture,
    removeProfilePicture,
    getUserById,
    getAllUsers
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Route to get all users
router.get('/', auth, getAllUsers);

// Route to get a single user by ID
router.get('/:id', auth, getUserById);

// Route to upload/change profile picture
router.post(
    '/profile-picture',
    auth,
    upload.single('avatar'),
    uploadProfilePicture
);

// Route to remove profile picture
router.delete(
    '/profile-picture',
    auth,
    removeProfilePicture
);

export default router;
