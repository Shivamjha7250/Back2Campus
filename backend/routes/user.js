import express from 'express';
import {
  updateProfilePhoto,
  removeProfilePhoto,
  getUserById,
  getAllUsers,
  updateUserProfile,
  changePassword,
  updatePrivacySettings
} from '../controllers/userController.js';
import auth from '../middlewares/authMiddleware.js';
import upload from '../config/cloudinary.js'; 

const router = express.Router();

router.get('/', auth, getAllUsers);
router.get('/:id', auth, getUserById);

router.post('/profile-picture', auth, upload.single('avatar'), updateProfilePhoto);
router.delete('/profile-picture', auth, removeProfilePhoto);

router.put('/profile', auth, updateUserProfile);

router.put('/change-password', auth, changePassword);
router.put('/privacy', auth, updatePrivacySettings);
export default router;
