// backend/models/Conversation.js
import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  ],
  lastMessage: { type: String, default: '' },
  unreadCount: { type: Number, default: 0 }
}, { timestamps: true });

const Conversation = mongoose.models.Conversation ||
                     mongoose.model('Conversation', ConversationSchema);

export default Conversation;
