import express from 'express';
import {
    getConversations,
    getMessages,
    sendMessage,
    sendFileMessage,
    deleteMessageForMe,
    deleteMessageForEveryone,
    editMessage,
    initiateConversation,
    clearChat,
} from '../controllers/chatController.js';

import upload from '../config/cloudinary.js';  
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/initiate', protect, initiateConversation);
router.post('/clear/:conversationId', protect, clearChat);
router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/message', protect, sendMessage);
router.post('/file', protect, upload.single('chatFile'), sendFileMessage);
router.put('/edit/:messageId', protect, editMessage);
router.delete('/me/:messageId', protect, deleteMessageForMe);
router.delete('/everyone/:messageId', protect, deleteMessageForEveryone);

export default router;
