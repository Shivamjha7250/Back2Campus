import React, { useMemo } from 'react';
import API_BASE_URL from '../pages/apiConfig';
import { FileText, Image as ImageIcon, Video } from 'lucide-react';

const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
};

const getMessagePreview = (lastMessage) => {
    if (!lastMessage) return 'No messages yet';
    switch (lastMessage.messageType) {
        case 'text':
            return lastMessage.text || 'No text';
        case 'image':
            return <div className="flex items-center gap-1"><ImageIcon size={16} /> Photo</div>;
        case 'video':
            return <div className="flex items-center gap-1"><Video size={16} /> Video</div>;
        case 'pdf':
        case 'doc':
        default:
            return <div className="flex items-center gap-1"><FileText size={16} /> File</div>;
    }
};

const ChatListItem = React.memo(({ conv, currentUser, isSelected, isOnline, isTyping, onSelect }) => {
    const partner = useMemo(() => conv.members.find(m => m?._id !== currentUser?._id), [conv.members, currentUser]);

    if (!partner) return null;

    const profilePic = partner.profile?.avatar
        ? `${API_BASE_URL}${partner.profile.avatar}`
        : 'https://placehold.co/48x48/EFEFEF/AAAAAA&text=A';
        
    const lastMessagePreview = getMessagePreview(conv.lastMessage);
    const lastMessageTime = conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : '';

    return (
        <div
            className={`flex items-center p-3 cursor-pointer border-b ${isSelected ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
            onClick={() => onSelect(conv)}
        >
            <div className="relative">
                <img src={profilePic} alt={`${partner.firstName} avatar`} className="w-12 h-12 rounded-full object-cover" />
                <span
                    className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`}
                    title={isOnline ? 'Online' : 'Offline'}
                />
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <div className="font-semibold truncate">{partner.firstName} {partner.lastName}</div>
                    <div className="text-xs text-gray-400 ml-2 flex-shrink-0">{lastMessageTime}</div>
                </div>
                <div className={`text-sm truncate flex items-center gap-1 ${isTyping ? 'text-blue-600 italic' : 'text-gray-600'}`}>
                    {isTyping ? 'Typing...' : lastMessagePreview}
                </div>
            </div>
        </div>
    );
});

const ChatList = ({ currentUser, conversations, selectedChat, onSelectChat, onlineUsers, loading, error, typingUsers }) => {
    if (loading) return <div className="p-4 text-gray-500 text-center">Loading chats...</div>;
    if (error) return <div className="p-4 text-red-500 text-center">Error: {error}</div>;
    if (!conversations || conversations.length === 0) return <div className="p-4 text-gray-500 text-center">No conversations found.</div>;

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b font-bold text-xl">Chats</div>
            {conversations.map(conv => {
                const partner = conv.members.find(m => m?._id !== currentUser?._id);
                if (!partner) return null;
                return (
                    <ChatListItem
                        key={conv._id}
                        conv={conv}
                        currentUser={currentUser}
                        isSelected={selectedChat?._id === conv._id}
                        isOnline={onlineUsers.includes(partner._id)}
                        isTyping={typingUsers[conv._id] === partner._id}
                        onSelect={onSelectChat}
                    />
                );
            })}
        </div>
    );
};

export default ChatList;
