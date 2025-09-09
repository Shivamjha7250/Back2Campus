import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .populate('sender', 'firstName lastName profile.avatar')
            .populate('post') 
            .sort({ createdAt: -1 });

    
        const validNotifications = notifications.filter(notification => {
            
            if (notification.type === 'like' || notification.type === 'comment') {
                return notification.post != null;
            }

            return true;
        });
            
        res.status(200).json(validNotifications);
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

export const markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { $set: { read: true } });
        res.status(200).json({ message: 'Notifications marked as read.' });
    } catch (error) {
        res.status(500).json({ message: 'Server error.' });
    }
};