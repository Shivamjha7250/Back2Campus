import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/conversationModel.js';
import { getSocketId } from '../socket.js'; 


export const sendRequest = async (req, res) => {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
        return res.status(400).json({ message: "You cannot send a request to yourself." });
    }

    try {
        
        await User.updateOne({ _id: senderId }, { $addToSet: { sentRequests: receiverId } });
        await User.updateOne({ _id: receiverId }, { $addToSet: { receivedRequests: senderId } });

        const sender = await User.findById(senderId).select('firstName lastName userType profile.avatar');
        
        const newRequestPayload = {
            _id: senderId,
            sender: sender
        };

        const receiverSocketId = getSocketId(receiverId);

    
        if (receiverSocketId) {
        
            req.io.to(receiverSocketId).emit(`connection_request_${receiverId}`, newRequestPayload);
            
            
            req.io.to(receiverSocketId).emit('new_request');
            
            console.log(` Emitted connection events to socket: ${receiverSocketId}`);
        } else {
            console.log(`User ${receiverId} is not online.`);
        }

        res.status(200).json({ message: 'Request sent successfully.' });
    } catch (error) {
        console.error("Error sending request:", error);
        res.status(500).json({ message: 'Server error while sending request.' });
    }
};

export const respondToRequest = async (req, res) => {
    const receiverId = req.user.id;
    const { requestId, action } = req.body; 

    try {
        await User.updateOne({ _id: receiverId }, { $pull: { receivedRequests: requestId } });
        await User.updateOne({ _id: requestId }, { $pull: { sentRequests: receiverId } });

        if (action === 'accept') {
            await User.updateOne({ _id: receiverId }, { $addToSet: { connections: requestId } });
            await User.updateOne({ _id: requestId }, { $addToSet: { connections: receiverId } });
            
            const existingConversation = await Conversation.findOne({
                members: { $all: [receiverId, requestId] }
            });

            if (!existingConversation) {
                const newConversation = new Conversation({
                    members: [receiverId, requestId],
                });
                await newConversation.save();
            }

            const newConnectionForReceiver = await User.findById(requestId).select('firstName lastName userType profile.avatar');
            const newConnectionForSender = await User.findById(receiverId).select('firstName lastName userType profile.avatar');
            
            const receiverSocketId = getSocketId(receiverId);
            if(receiverSocketId) req.io.to(receiverSocketId).emit(`new_connection_${receiverId}`, newConnectionForSender);

            const senderSocketId = getSocketId(requestId);
            if(senderSocketId) req.io.to(senderSocketId).emit(`new_connection_${requestId}`, newConnectionForReceiver);
        }
        
        const notification = new Notification({
            recipient: requestId,
            sender: receiverId,
            type: action === 'accept' ? 'request_accepted' : 'request_rejected',
        });
        await notification.save();
        
        const populatedNotification = await Notification.findById(notification._id).populate('sender', 'firstName lastName profile.avatar');
        
        const senderSocketId = getSocketId(requestId);
        if(senderSocketId) req.io.to(senderSocketId).emit(`notification_${requestId}`, populatedNotification);
        
        if(senderSocketId) req.io.to(senderSocketId).emit('new_notification');


        res.status(200).json({ message: `Request ${action}ed successfully.` });
    } catch (error) {
        console.error("Error in respondToRequest:", error);
        res.status(500).json({ message: 'Server error while responding to request.' });
    }
};

export const getReceivedRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'receivedRequests',
                select: 'firstName lastName userType profile.avatar'
            });
        
        const formattedRequests = user.receivedRequests.map(sender => ({
            _id: sender._id, 
            sender: sender
        }));
        res.status(200).json(formattedRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching requests.' });
    }
};

export const getMyConnections = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('connections', 'firstName lastName userType profile.avatar');
        res.status(200).json(user.connections);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching connections.' });
    }
};

export const removeConnection = async (req, res) => {
    const userId = req.user.id;
    const { connectionId } = req.params;

    try {
        await User.updateOne({ _id: userId }, { $pull: { connections: connectionId } });
        await User.updateOne({ _id: connectionId }, { $pull: { connections: userId } });

        const userSocketId = getSocketId(userId);
        if(userSocketId) req.io.to(userSocketId).emit(`connection_removed_${userId}`, { connectionId });

        const connectionSocketId = getSocketId(connectionId);
        if(connectionSocketId) req.io.to(connectionSocketId).emit(`connection_removed_${connectionId}`, { connectionId: userId });

        res.status(200).json({ message: 'Connection removed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error while removing connection.' });
    }
};