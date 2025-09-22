import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from './apiConfig';
import { useOutletContext, Link } from 'react-router-dom';
import { Heart, MessageSquare, UserCheck, UserX } from 'lucide-react';
import { socket } from '../socket';

const getNotificationLink = (notification) => {
    if (notification.post && (notification.type === 'like' || notification.type === 'comment')) {
        return `/post/${notification.post._id}`;
    }
    if (notification.type === 'request_accepted') {
        return `/profile/${notification.sender._id}`;
    }
    return '#';
};

const getNotificationMessage = (notification) => {
    const senderName = `${notification.sender?.firstName || ''} ${notification.sender?.lastName || ''}`;
    switch (notification.type) {
        case 'like':
            return <p><strong className="hover:underline">{senderName}</strong> liked your post.</p>;
        case 'comment':
            return <p><strong className="hover:underline">{senderName}</strong> commented on your post.</p>;
        case 'request_accepted':
            return <p><strong className="hover:underline">{senderName}</strong> accepted your connection request.</p>;
        case 'request_rejected':
            return <p><strong className="hover:underline">{senderName}</strong> rejected your connection request.</p>;
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

    useEffect(() => {
        const handleNewNotification = (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
        };
        socket.on('new_notification', handleNewNotification);
        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, []);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-xl">
                <h2>Loading notifications...</h2>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-4">Notifications</h2>
            {notifications.length > 0 ? (
                <div className="space-y-2">
                    {notifications.map(notif => {
                        const senderAvatarUrl = notif.sender?.profile?.avatar?.url || 'https://placehold.co/40x40';
                        return (
                            <Link key={notif._id} to={getNotificationLink(notif)} className="block">
                                <div className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${!notif.read ? 'bg-blue-50' : ''} hover:bg-gray-100`}>
                                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notif.type)}</div>
                                    <div className="flex-grow">
                                        {getNotificationMessage(notif)}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(notif.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <img
                                        src={senderAvatarUrl}
                                        alt={`Avatar of ${notif.sender?.firstName || 'User'}`}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                            </Link>
                        );
                    })}
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
