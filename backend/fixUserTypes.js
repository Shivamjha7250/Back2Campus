import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const fixUserTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    const users = await User.find({});
    let studentFixed = 0;
    let alumniFixed = 0;

    for (const user of users) {
      if (user.userType === 'student') {
        user.userType = 'Student';
        await user.save();
        studentFixed++;
      }
      if (user.userType === 'alumni') {
        user.userType = 'Alumni';
        await user.save();
        alumniFixed++;
      }
    }

    console.log(` Fixed "student" → "Student": ${studentFixed}`);
    console.log(` Fixed "alumni" → "Alumni": ${alumniFixed}`);
    process.exit();
  } catch (err) {
    console.error(' Error fixing userType:', err);
    process.exit(1);
  }
};

fixUserTypes();
