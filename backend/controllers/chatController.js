// backend/controllers/chatController.js

import Conversation from '../models/Conversation.js'
import Message      from '../models/Message.js'

/**
 * Create & send a new message
 */
export const createMessage = async (req, res) => {
  const { conversationId, receiverId, text } = req.body
  try {
    const files = (req.files || []).map(f => ({
      url:      `/uploads/chat/${f.filename}`,
      fileName: f.originalname,
      fileType: f.mimetype
    }))

    const msg = new Message({
      conversationId,
      sender:   req.user.id,
      receiver: receiverId,
      text,
      files,
      status:   'sent'
    })
    await msg.save()

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: text || 'File',
      $inc:        { unreadCount: 1 }
    })

    return res.status(201).json(msg)
  } catch (err) {
    console.error('❌ createMessage Error:', err)
    return res.status(500).json({ message: 'Server error sending message.' })
  }
}

/**
 * Get messages for a conversation
 */
export const getMessages = async (req, res) => {
  try {
    const msgs = await Message.find({ conversationId: req.params.conversationId })
                              .sort('createdAt')
    return res.status(200).json(msgs)
  } catch (err) {
    console.error('❌ getMessages Error:', err)
    return res.status(500).json({ message: 'Error fetching messages.' })
  }
}

/**
 * Mark messages as seen
 */
export const markMessagesAsSeen = async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.body.conversationId, receiver: req.user.id },
      { status: 'seen' }
    )
    return res.status(200).json({ message: 'Messages marked as seen.' })
  } catch (err) {
    console.error('❌ markMessagesAsSeen Error:', err)
    return res.status(500).json({ message: 'Error updating seen.' })
  }
}

/**
 * Delete a single message
 */
export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.messageId)
    return res.status(200).json({ message: 'Message deleted.' })
  } catch (err) {
    console.error('❌ deleteMessage Error:', err)
    return res.status(500).json({ message: 'Error deleting message.' })
  }
}

/**
 * Clear all messages in a conversation
 */
export const clearConversation = async (req, res) => {
  try {
    await Message.deleteMany({ conversationId: req.params.conversationId })
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      unreadCount: 0
    })
    return res.status(200).json({ message: 'Conversation cleared.' })
  } catch (err) {
    console.error('❌ clearConversation Error:', err)
    return res.status(500).json({ message: 'Error clearing conversation.' })
  }
}

/**
 * Get all conversations for the current user
 */
export const getUserConversations = async (req, res) => {
  try {
    const convos = await Conversation
      .find({ participants: req.user.id })
      .populate('participants', '-password')
      .sort('-updatedAt')

    return res.status(200).json(convos)
  } catch (err) {
    console.error('❌ getUserConversations Error:', err)
    return res.status(500).json({ message: 'Error fetching conversations.' })
  }
}
