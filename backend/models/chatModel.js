import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String },
    messageType: { type: String, enum: ['text', 'image', 'video', 'pdf', 'doc'], default: 'text' },
    fileUrl: { type: String },
    replyTo: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
        text: { type: String },
        senderName: { type: String }
    },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    

    isEdited: { type: Boolean, default: false },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
