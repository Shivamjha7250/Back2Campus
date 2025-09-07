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

import { uploadChatFile } from '../config/multer.js'; 
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

// --- Chat API Routes ---

router.post('/initiate', protect, initiateConversation);
router.post('/clear/:conversationId', protect, clearChat);
router.get('/conversations', protect, getConversations);
router.get('/messages/:conversationId', protect, getMessages);
router.post('/message', protect, sendMessage);
router.post('/file', protect, uploadChatFile.single('file'), sendFileMessage);
router.put('/edit/:messageId', protect, editMessage);
router.delete('/me/:messageId', protect, deleteMessageForMe);
router.delete('/everyone/:messageId', protect, deleteMessageForEveryone);

export default router;
