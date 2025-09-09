import React, { useEffect, useState, useCallback } from 'react';
import ChatList from '../components/ChatList';
import ChatView from '../components/ChatView';
import { socket } from '../socket';
import API_BASE_URL from './apiConfig';

const ChatPage = () => {
    const [user, setUser] = useState(null);
    const [selectedChat, setSelectedChat] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCounts, setUnreadCounts] = useState({});

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            setUser(storedUser);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setConversations(data);
            if (socket.connected) {
                socket.emit('joinConversations', data.map(c => c._id));
            }
        } catch (e) {
            console.error("Fetch Conversations Error:", e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        if (!socket.connected) {
            socket.auth = { userId: user._id };
            socket.connect();
        }

        fetchConversations();

        const handleOnlineUsers = (users) => setOnlineUsers(users);

        const handleNewMessage = (newMessage) => {
            setConversations(prev => {
                const convoToUpdate = prev.find(c => c._id === newMessage.conversationId);
                if (!convoToUpdate) return prev;
                const updatedConvo = { ...convoToUpdate, lastMessage: newMessage, lastMessageTimestamp: newMessage.createdAt };
                const otherConvos = prev.filter(c => c._id !== newMessage.conversationId);
                return [updatedConvo, ...otherConvos];
            });
        };
        
        const handleNewChat = ({ conversationId }) => {
            if (selectedChat?._id !== conversationId) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [conversationId]: (prev[conversationId] || 0) + 1
                }));
            }
        };

        socket.on('onlineUsers', handleOnlineUsers);
        socket.on('newMessage', handleNewMessage);
        socket.on('new_chat', handleNewChat);

        return () => {
            socket.off('onlineUsers', handleOnlineUsers);
            socket.off('newMessage', handleNewMessage);
            socket.off('new_chat', handleNewChat);
        };
    }, [user, fetchConversations, selectedChat]);

    
    const handleSelectChat = useCallback((chat) => {
        setSelectedChat(chat);
        setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
        
        if (socket.connected && user) {
            socket.emit('mark_as_seen', { conversationId: chat._id, userId: user._id });
        }
    }, [user]);
    
    const handleBack = useCallback(() => setSelectedChat(null), []);

    return (
        <div className="flex h-[calc(100vh-80px)] bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className={`w-full md:w-1/3 border-r transition-transform duration-300 ${selectedChat ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                <ChatList
                    currentUser={user}
                    conversations={conversations}
                    onSelectChat={handleSelectChat}
                    onlineUsers={onlineUsers}
                    selectedChat={selectedChat}
                    unreadCounts={unreadCounts}
                    loading={loading}
                />
            </div>
            <div className={`absolute top-0 left-0 w-full h-full md:static md:w-2/3 transition-transform duration-300 ${selectedChat ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                <ChatView
                    currentUser={user}
                    selectedChat={selectedChat}
                    onlineUsers={onlineUsers}
                    onBack={handleBack}
                />
            </div>
        </div>
    );
};

export default ChatPage;