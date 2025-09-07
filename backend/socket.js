import Chat from '../backend/models/chatModel.js';
import Conversation from '../backend/models/conversationModel.js';
import User from '../backend/models/User.js';

const onlineUsers = new Map();

export default function initSocket(io) {
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    if (!userId) return next(new Error("Invalid userId"));
    socket.userId = userId;
    next();
  });

  io.on('connection', async (socket) => {
    console.log(' Connected:', socket.userId);
    onlineUsers.set(socket.userId, socket.id);

    await User.findByIdAndUpdate(socket.userId, { isOnline: true });

    
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));

    
    socket.on('joinConversations', (conversationIds) => {
      conversationIds.forEach(id => socket.join(id));
    });

    //  Chat 
    socket.on('sendMessage', async (data) => {
      const { conversationId, sender, text, fileUrl, messageType, replyTo } = data;
      const newMsg = new Chat({ conversationId, sender, text, fileUrl, messageType, replyTo });
      const saved = await newMsg.save();

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text || messageType,
        lastMessageTimestamp: Date.now()
      });

      
      io.to(conversationId).emit('newMessage', saved);

      
      const conversation = await Conversation.findById(conversationId);
      const recipients = conversation.participants.filter(id => id.toString() !== sender);

      recipients.forEach(userId => {
        const socketId = onlineUsers.get(userId.toString());
        if (socketId) {
          io.to(socketId).emit('new_chat');
        }
      });
    });

    //  Typing indicator (optional)
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(conversationId).emit('typing', { conversationId, userId });
    });

  
    socket.on('send_request', (targetUserId) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('new_request');
      }
    });

    
    socket.on('send_notification', (targetUserId) => {
      const targetSocketId = onlineUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('new_notification');
      }
    });

    //  Disconnect
    socket.on('disconnect', async () => {
      console.log(' Disconnected:', socket.userId);
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });
}
