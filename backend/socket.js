import Chat from './models/chatModel.js';
import Conversation from './models/conversationModel.js';
import User from './models/User.js';

const onlineUsers = new Map();

export const getSocketId = (userId) => onlineUsers.get(userId);

export default function initSocket(io) {

    io.use((socket, next) => {
        const userId = socket.handshake.auth.userId;
        if (!userId) {
            return next(new Error("Invalid userId"));
        }
        socket.userId = userId;
        next();
    });

    io.on('connection', async (socket) => {
        console.log(' Connected:', socket.userId, 'Socket ID:', socket.id);

    
        onlineUsers.set(socket.userId, socket.id);

        
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));

        socket.on('joinConversations', (conversationIds) => {
            conversationIds.forEach(id => socket.join(id));
        });


        socket.on('sendMessage', async (data) => {
            try {
                
                const newMsg = new Chat({ ...data, status: 'sent' });
                const savedMessage = await newMsg.save();

                await Conversation.findByIdAndUpdate(data.conversationId, {
                    lastMessage: savedMessage._id,
                    lastMessageTimestamp: savedMessage.createdAt,
                });


                const populatedMessage = await Chat.findById(savedMessage._id)
                    .populate('sender', 'firstName lastName profile.avatar');

                
                io.to(data.conversationId).emit('newMessage', populatedMessage);
                
    
                const conversation = await Conversation.findById(data.conversationId);
                const recipients = conversation.members.filter(id => id.toString() !== data.sender);

            
                recipients.forEach(userId => {
                    const socketId = getSocketId(userId.toString());
                    if (socketId) {
                        io.to(socketId).emit('new_chat', { conversationId: data.conversationId });
                    }
                });

            } catch (error) {
                console.error("Error in sendMessage handler:", error);
            }
        });

        socket.on('mark_as_seen', async ({ conversationId, userId }) => {
            try {
            
                await Chat.updateMany(
                    { conversationId: conversationId, sender: { $ne: userId }, status: { $ne: 'seen' } },
                    { $set: { status: 'seen' } }
                );

            
                const conversation = await Conversation.findById(conversationId);
                const otherUserId = conversation.members.find(id => id.toString() !== userId);
                
                if (otherUserId) {
                    const socketId = getSocketId(otherUserId.toString());
                    if (socketId) {
                    
                        io.to(socketId).emit('messages_seen', { conversationId });
                    }
                }
            } catch (error) {
                console.error("Error in mark_as_seen handler:", error);
            }
        });

        
        socket.on('disconnect', () => {
            console.log(' Disconnected:', socket.userId);
            
            onlineUsers.delete(socket.userId);
            
            io.emit('onlineUsers', Array.from(onlineUsers.keys()));
        });
    });
}