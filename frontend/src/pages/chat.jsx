import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const [error, setError] = useState(null);
    const [typingUsers, setTypingUsers] = useState({});
    
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                setUser(storedUser);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error("Failed to parse user from local storage", e);
            setLoading(false);
        }
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error("Authentication token not found.");

            const res = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ message: res.statusText }));
                throw new Error(errorData.message || `Failed to fetch conversations: ${res.statusText}`);
            }
            
            const data = await res.json();
            setConversations(data);
            
            if (socket.connected) {
                socket.emit('joinConversations', data.map(c => c._id));
            }
        } catch (e) {
            console.error("Fetch Conversations Error:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchConversations();
        }
    }, [user, fetchConversations]);

    useEffect(() => {
        if (location.state?.conversation) {
            const newConversation = location.state.conversation;
            setSelectedChat(newConversation);
            setConversations(prev => {
                const isAlreadyInList = prev.some(c => c._id === newConversation._id);
                return isAlreadyInList ? prev : [newConversation, ...prev];
            });
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (!user) return;

        if (!socket.connected) {
            socket.auth = { userId: user._id };
            socket.connect();
        }

        const handleOnlineUsers = (users) => setOnlineUsers(users);
        
        const handleTyping = ({ conversationId, userId }) => {
            setTypingUsers(prev => ({ ...prev, [conversationId]: userId }));
            setTimeout(() => {
                setTypingUsers(prev => {
                    const newTypingUsers = { ...prev };
                    delete newTypingUsers[conversationId];
                    return newTypingUsers;
                });
            }, 3000);
        };

        const handleNewMessage = (newMessage) => {
            setConversations(prevConvos => {
                const convoToUpdate = prevConvos.find(c => c._id === newMessage.conversationId);
                if (!convoToUpdate) { 
                    fetchConversations();
                    return prevConvos;
                }
                const updatedConvo = { ...convoToUpdate, lastMessage: newMessage };
                const otherConvos = prevConvos.filter(c => c._id !== newMessage.conversationId);
                return [updatedConvo, ...otherConvos];
            });
        };
        
        const handleMessageDeleted = () => fetchConversations();

        socket.on('onlineUsers', handleOnlineUsers);
        socket.on('typing', handleTyping);
        socket.on('newMessage', handleNewMessage);
        socket.on('messageDeleted', handleMessageDeleted);

        return () => {
            socket.off('onlineUsers', handleOnlineUsers);
            socket.off('typing', handleTyping);
            socket.off('newMessage', handleNewMessage);
            socket.off('messageDeleted', handleMessageDeleted);
        };
    }, [user, fetchConversations]);

    const handleSelectChat = useCallback((chat) => setSelectedChat(chat), []);
    const handleBack = useCallback(() => setSelectedChat(null), []);

    return (
        <div className="flex h-screen bg-white">
            <div className={`w-full sm:w-1/3 border-r ${selectedChat ? 'hidden sm:block' : 'block'}`}>
                <ChatList
                    currentUser={user}
                    conversations={conversations}
                    selectedChat={selectedChat}
                    onSelectChat={handleSelectChat}
                    onlineUsers={onlineUsers}
                    loading={loading}
                    error={error}
                    typingUsers={typingUsers}
                />
            </div>
            <div className={`w-full sm:w-2/3 ${selectedChat ? 'block' : 'hidden sm:block'}`}>
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
