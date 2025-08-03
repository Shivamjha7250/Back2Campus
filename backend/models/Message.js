// backend/models/Message.js
import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  url: String,
  fileName: String,
  fileType: String
});

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation', required: true
  },
  sender:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:     { type: String, default: '' },
  files:    [FileSchema],
  status:   { type: String, enum: ['sent','seen'], default: 'sent' }
}, { timestamps: true });

const Message = mongoose.models.Message ||
                mongoose.model('Message', MessageSchema);

export default Message;
