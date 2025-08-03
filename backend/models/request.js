import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  senderName: String,
  avatar: String,
  mutualConnections: Number,
  time: String,
});

export default mongoose.model('Request', requestSchema);
