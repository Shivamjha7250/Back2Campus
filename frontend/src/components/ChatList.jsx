import React, { useMemo } from 'react';
import API_BASE_URL from '../pages/apiConfig';
import { FileText, Image as ImageIcon, Video } from 'lucide-react';


const formatTime = (isoString) => { 
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

const getMessagePreview = (lastMessage) => {
    if (!lastMessage) return "No messages yet.";
    if (lastMessage.messageType === 'text') return lastMessage.text;
    if (lastMessage.messageType === 'image') return <div className="flex items-center gap-1"><ImageIcon size={16} /> Photo</div>;
    if (lastMessage.messageType === 'video') return <div className="flex items-center gap-1"><Video size={16} /> Video</div>;
    return <div className="flex items-center gap-1"><FileText size={16} /> File</div>;
};


const ChatListItem = React.memo(({ conv, currentUser, isSelected, isOnline, onSelect, unreadCount }) => {
    const partner = useMemo(() => conv.members?.find(m => m?._id !== currentUser?._id), [conv.members, currentUser]);

    if (!partner) return null;


    const profilePic = partner.profile?.avatar
        ? partner.profile.avatar
        : 'https://placehold.co/48x48/EFEFEF/AAAAAA&text=A';
        
    const lastMessagePreview = getMessagePreview(conv.lastMessage);
    const lastMessageTime = conv.lastMessageTimestamp ? formatTime(conv.lastMessageTimestamp) : '';

    return (
        <div
            className={`flex items-center p-3 cursor-pointer border-l-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'}`}
            onClick={() => onSelect(conv)}
        >
            <div className="relative">
                <img src={profilePic} alt={`${partner.firstName} avatar`} className="w-12 h-12 rounded-full object-cover" />
                <span
                    className={`absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ring-2 ring-white`}
                    title={isOnline ? 'Online' : 'Offline'}
                />
            </div>
            <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <div className="font-semibold truncate">{partner.firstName} {partner.lastName}</div>
                    <div className="text-xs text-gray-500 ml-2 flex-shrink-0">{lastMessageTime}</div>
                </div>
                <div className="flex justify-between items-center">
                    <div className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-black' : 'text-gray-600'}`}>
                        {lastMessagePreview}
                    </div>
                
                    {unreadCount > 0 && (
                        <span className="ml-2 text-xs font-semibold text-white bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

const ChatList = ({ currentUser, conversations, selectedChat, onSelectChat, onlineUsers, loading, unreadCounts }) => {
    if (loading) return <div className="p-4 text-gray-500 text-center">Loading chats...</div>;
    if (!conversations || conversations.length === 0) return <div className="p-4 text-gray-500 text-center">No conversations found.</div>;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b">
                <h2 className="font-bold text-xl">Chats</h2>
            </div>
            <div className="overflow-y-auto">
                {conversations.map(conv => {
                    const partner = conv.members?.find(m => m?._id !== currentUser?._id);
                    if (!partner) return null;
                    
                    return (
                        <ChatListItem
                            key={conv._id}
                            conv={conv}
                            currentUser={currentUser}
                            isSelected={selectedChat?._id === conv._id}
                            isOnline={onlineUsers.includes(partner._id)}
                            onSelect={onSelectChat}
                            unreadCount={unreadCounts[conv._id] || 0}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default ChatList;