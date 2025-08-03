import express from 'express'
import {
  createMessage,
  getMessages,
  getUserConversations,
  deleteMessage,
  markMessagesAsSeen,
  clearConversation
} from '../controllers/chatController.js'
import auth from '../middleware/auth.js'
import { upload } from '../config/multer.js'

const router = express.Router()

router.post('/messages',            auth, upload.array('files', 5), createMessage)
router.get('/messages/:conversationId', auth, getMessages)
router.get('/conversations',        auth, getUserConversations)
router.put('/messages/seen',        auth, markMessagesAsSeen)
router.delete('/messages/:messageId', auth, deleteMessage)
router.delete('/conversation/:conversationId', auth, clearConversation)

export default router
