import User from '../models/User.js';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

export const updateProfilePhoto = async (req, res) => {
try {
 const user = await User.findById(req.user.id);
 if (!user) return res.status(404).json({ message: 'User not found' });

 if (user.profile?.avatar) {
 const oldPath = path.join(process.cwd(), user.profile.avatar);
 if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
 }

 user.profile = {
 ...user.profile,
 avatar: `/uploads/avatars/${req.file.filename}`,
};

 await user.save();
 res.status(200).json({ avatarUrl: user.profile.avatar });
} catch (error) {
 console.error(' Error uploading profile photo:', error);
 res.status(500).json({ message: 'Failed to update profile photo' });
}
};

export const removeProfilePhoto = async (req, res) => {
try {
 const user = await User.findById(req.user.id);
 if (!user) return res.status(404).json({ message: 'User not found' });

 if (user.profile?.avatar) {
 const fullPath = path.join(process.cwd(), user.profile.avatar);
 if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
 }

 user.profile.avatar = '';
 await user.save();
 res.status(200).json({ message: 'Profile photo removed' });
} catch (error) {
 console.error(' Error removing profile photo:', error);
 res.status(500).json({ message: 'Failed to remove profile photo' });
}
};

export const getAllUsers = async (req, res) => {
try {
 const users = await User.find().select('-password');
 res.status(200).json(users);
} catch (error) {
 console.error(' Error getting users:', error);
 res.status(500).json({ message: 'Failed to get users' });
}
};

export const getUserById = async (req, res) => {
try {
 const user = await User.findById(req.params.id).select('-password');
 if (!user) return res.status(404).json({ message: 'User not found' });
 res.status(200).json(user);
} catch (error) {
 console.error(' Error getting user by ID:', error);
 res.status(500).json({ message: 'Failed to get user' });
}
};

export const updateUserProfile = async (req, res) => {
try {
 const userId = req.user.id;
 const { 
  firstName, lastName, userType, education, 
  internship, currentJob, previousJob 
} = req.body;

 const user = await User.findById(userId);
 if (!user) {
  return res.status(404).json({ message: 'User not found' });
 }

 if (firstName !== undefined) user.firstName = firstName;
 if (lastName !== undefined) user.lastName = lastName;
 if (userType !== undefined) user.userType = userType;

 user.profile = user.profile || {};
 
 if (education !== undefined) user.profile.education = education;
 if (internship !== undefined) user.profile.internship = internship;
 if (currentJob !== undefined) user.profile.currentJob = currentJob;
 if (previousJob !== undefined) user.profile.previousJob = previousJob;

 const updatedUser = await user.save();
 res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
} catch (error) {
 console.error(' Error updating profile:', error);
 res.status(500).json({ message: 'Failed to update profile' });
}
};

export const changePassword = async (req, res) => {
try {
 const userId = req.user.id;
 const { currentPassword, newPassword } = req.body;

 if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide both current and new passwords.' });
  }

 const user = await User.findById(userId).select('+password');
 if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!user.password) {
      return res.status(400).json({ message: 'User does not have a password set up. Cannot change password.' });
  }

 const isMatch = await bcrypt.compare(currentPassword, user.password);
 
 if (!isMatch) {
 return res.status(400).json({ message: 'Old password is incorrect' });
 }

 user.password = newPassword; 

 await user.save();

 res.status(200).json({ message: 'Password updated successfully' });
} catch (error) {
 console.error(' Error changing password:', error);
 res.status(500).json({ message: 'Failed to change password' });
}
};


export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profileVisibility, connectionRequests } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.privacy = user.privacy || {};

  
    if (profileVisibility !== undefined) user.privacy.profileVisibility = profileVisibility;
    if (connectionRequests !== undefined) user.privacy.connectionRequests = connectionRequests;

    const updatedUser = await user.save();

    res.status(200).json({ message: 'Privacy settings updated successfully', privacy: updatedUser.privacy });
  } catch (error) {
    console.error(' Error updating privacy settings:', error);
    res.status(500).json({ message: 'Failed to update privacy settings' });
  }
};