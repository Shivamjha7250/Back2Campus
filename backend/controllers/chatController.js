import Chat from '../models/chatModel.js';
import Conversation from '../models/conversationModel.js';
import path from 'path';

const getMessageTypeFromFile = (file) => {
    if (!file || !file.originalname) return 'doc';
    const extension = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) return 'image';
    if (['.mp4', '.webm', '.mov', '.avi'].includes(extension)) return 'video';
    if (extension === '.pdf') return 'pdf';
    return 'doc';
};


export const initiateConversation = async (req, res) => {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    try {
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] },
        }).populate('members', 'firstName lastName profile');

        if (!conversation) {
            conversation = new Conversation({
                members: [senderId, receiverId],
            });
            await conversation.save();

            conversation = await Conversation.findById(conversation._id).populate('members', 'firstName lastName profile');
        }

        res.status(200).json(conversation);
    } catch (err) {
        console.error('Initiate Conversation Error:', err);
        res.status(500).json({ message: 'Failed to initiate conversation' });
    }
};

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ members: req.user._id })
            .populate('members', 'firstName lastName profile')
            .populate({
                path: 'lastMessage',
                model: 'Chat',
                populate: { path: 'sender', select: 'firstName' }
            })
            .sort({ lastMessageTimestamp: -1 }); 
        res.status(200).json(conversations);
    } catch (err) {
        console.error('Get Conversations Error:', err);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await Chat.find({
            conversationId: req.params.conversationId,
            deletedBy: { $ne: req.user._id }
        }).populate('sender', 'firstName lastName profile');
        res.status(200).json(messages);
    } catch (err) {
        console.error('Get Messages Error:', err);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { conversationId, text, replyTo } = req.body;
        const newMsg = new Chat({ conversationId, sender: req.user._id, text, messageType: 'text', replyTo });
        const savedMsg = await newMsg.save();
        
        await Conversation.findByIdAndUpdate(conversationId, { 
            lastMessage: savedMsg._id,
            lastMessageTimestamp: savedMsg.createdAt 
        });

        const populatedMsg = await Chat.findById(savedMsg._id).populate('sender', 'firstName lastName profile');
        req.io.to(conversationId.toString()).emit('newMessage', populatedMsg);
        res.status(201).json(populatedMsg);
    } catch (err) {
        console.error('Send Message Error:', err);
        res.status(500).json({ message: 'Message sending failed' });
    }
};

export const sendFileMessage = async (req, res) => {
    try {
        const { conversationId } = req.body;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const messageType = getMessageTypeFromFile(req.file);
        const newMessage = new Chat({
            conversationId,
            sender: req.user._id,
            messageType,
            fileUrl: `/uploads/chat/${req.file.filename}`,
            text: req.file.originalname,
        });
        const savedMessage = await newMessage.save();

        await Conversation.findByIdAndUpdate(conversationId, { 
            lastMessage: savedMessage._id,
            lastMessageTimestamp: savedMessage.createdAt
        });

        const populatedMessage = await Chat.findById(savedMessage._id).populate('sender', 'firstName lastName profile');
        req.io.to(conversationId.toString()).emit('newMessage', populatedMessage);
        res.status(201).json(populatedMessage);
    } catch (err) {
        console.error('Send File Message Error:', err);
        res.status(500).json({ message: 'Failed to send file message' });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newText } = req.body;
        const msg = await Chat.findById(messageId);

        if (!msg) return res.status(404).json({ message: 'Message not found' });
        if (msg.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized.' });

        const fiveMinutes = 5 * 60 * 1000;
        if (new Date() - new Date(msg.createdAt) > fiveMinutes) {
            return res.status(403).json({ message: 'Cannot edit messages older than 5 minutes.' });
        }

        msg.text = newText;
        msg.isEdited = true;
        await msg.save();

        const populatedMsg = await Chat.findById(msg._id).populate('sender', 'firstName lastName profile');
        req.io.to(msg.conversationId.toString()).emit('messageUpdated', populatedMsg);
        res.status(200).json(populatedMsg);
    } catch (err) {
        console.error('Edit Message Error:', err);
        res.status(500).json({ message: 'Failed to edit message' });
    }
};

export const deleteMessageForMe = async (req, res) => {
    try {
        await Chat.findByIdAndUpdate(req.params.messageId, {
            $addToSet: { deletedBy: req.user._id }
        });
        res.status(200).json({ message: 'Message deleted for you' });
    } catch (err) {
        console.error('Delete For Me Error:', err);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};


export const deleteMessageForEveryone = async (req, res) => {
    try {
        const msg = await Chat.findById(req.params.messageId);
        if (!msg) return res.status(404).json({ message: 'Message not found' });
        if (msg.sender.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized.' });
        
        await msg.deleteOne();
        
        req.io.to(msg.conversationId.toString()).emit('messageDeleted', {
            messageId: req.params.messageId,
            conversationId: msg.conversationId.toString()
        });
        
        res.status(200).json({ message: 'Message deleted for everyone' });
    } catch (err) {
        console.error('Delete For Everyone Error:', err);
        res.status(500).json({ message: 'Failed to delete message' });
    }
};

export const clearChat = async (req, res) => {
    try {
        const { conversationId } = req.params;
    
        await Chat.updateMany(
            { conversationId: conversationId },
            { $addToSet: { deletedBy: req.user._id } }
        );
        res.status(200).json({ message: 'Chat cleared for you' });
    } catch (err) {
        console.error('Clear Chat Error:', err);
        res.status(500).json({ message: 'Failed to clear chat' });
    }
};