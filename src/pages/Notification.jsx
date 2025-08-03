// File: frontend/pages/NotificationPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import io from 'socket.io-client';
import { useOutletContext } from 'react-router-dom';
import { Heart, MessageSquare, UserCheck, UserX } from 'lucide-react';

const socket = io(API_BASE_URL);

// Helper to format notification message
const getNotificationMessage = (notification) => {
    const senderName = `${notification.sender.firstName} ${notification.sender.lastName}`;
    switch (notification.type) {
        case 'like':
            return <p><strong>{senderName}</strong> liked your post.</p>;
        case 'comment':
            return <p><strong>{senderName}</strong> commented on your post.</p>;
        case 'request_accepted':
            return <p><strong>{senderName}</strong> accepted your connection request.</p>;
        case 'request_rejected':
            return <p><strong>{senderName}</strong> rejected your connection request.</p>;
        default:
            return <p>You have a new notification.</p>;
    }
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'like': return <Heart className="text-red-500" />;
        case 'comment': return <MessageSquare className="text-blue-500" />;
        case 'request_accepted': return <UserCheck className="text-green-500" />;
        case 'request_rejected': return <UserX className="text-gray-500" />;
        default: return null;
    }
};

const NotificationPage = () => {
    const { user: currentUser } = useOutletContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API_BASE_URL}/api/notifications`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);
    
    // Real-time listener
    useEffect(() => {
        if (currentUser) {
            socket.on(`notification_${currentUser._id}`, (newNotification) => {
                // To get sender details, we might need to fetch them or the backend should send populated data
                // For simplicity, we'll just prepend and let the user refresh for full details for now.
                setNotifications(prev => [newNotification, ...prev]);
            });
        }
        return () => {
            if (currentUser) socket.off(`notification_${currentUser._id}`);
        };
    }, [currentUser]);

    if (loading) return <div className="bg-white p-6 rounded-xl"><h2>Loading notifications...</h2></div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            {notifications.length > 0 ? (
                <div className="space-y-3">
                    {notifications.map(notif => (
                        <div key={notif._id} className={`flex items-start gap-4 p-3 rounded-lg ${!notif.read ? 'bg-blue-50' : ''}`}>
                            <div className="flex-shrink-0">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-grow">
                                {getNotificationMessage(notif)}
                                <p className="text-xs text-gray-500 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                            </div>
                            <img 
                                src={notif.sender.profile?.avatar ? `${API_BASE_URL}${notif.sender.profile.avatar}` : '[https://placehold.co/40x40/EFEFEF/AAAAAA&text=A](https://placehold.co/40x40/EFEFEF/AAAAAA&text=A)'} 
                                alt={notif.sender.firstName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500">You have no new notifications.</p>
                </div>
            )}
        </div>
    );
};

export default NotificationPage;
