import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const educationSchema = new mongoose.Schema({
  institution: { type: String, trim: true, default: '' },
  degree: { type: String, trim: true, default: '' },
  field: { type: String, trim: true, default: '' },
});

const experienceSchema = new mongoose.Schema({
  company: { type: String, trim: true, default: '' },
  role: { type: String, trim: true, default: '' },
  duration: { type: String, trim: true, default: '' },
});


const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  userType: {
    type: String,
    enum: ['Student', 'Alumni'],
    default: 'Student',
    set: v => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
  },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpires: { type: Date },
  sentRequests: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  receivedRequests: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],
  connections: [ { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ],

  profile: {
    
    avatar: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    
    bio: { type: String, default: '' },
    education: [educationSchema],
    internship: experienceSchema,
    currentJob: experienceSchema,
    previousJob: experienceSchema,
  },

  privacy: {
    profileVisibility: {
      type: String,
      enum: ['Everyone', 'Connections'],
      default: 'Everyone',
    },
    connectionRequests: {
      type: String,
      enum: ['Everyone', 'No one'],
      default: 'Everyone',
    },
  },

  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: null },

}, { timestamps: true });


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;