import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { socket } from '../socket';
import API_BASE_URL from '../pages/apiConfig';
import axios from 'axios';
import {
  Paperclip, Send, MoreVertical, Trash2, Edit,
  Reply, X, Check, CheckCheck, FileText, ArrowLeft, Brush
} from 'lucide-react';

const ChatHeader = ({ otherUser, isOnline, onBack, onClearChat }) => (
  <div className="flex items-center justify-between border-b p-3 bg-white sticky top-0 z-10">
    <div className="flex items-center">
      <button onClick={onBack} className="sm:hidden mr-4 text-gray-600 hover:text-black">
        <ArrowLeft size={20} />
      </button>
      
      <img src={otherUser.profilePic} alt={`${otherUser.name} avatar`} className="w-10 h-10 rounded-full object-cover mr-3" />
      <div>
        <div className="font-semibold">{otherUser.name}</div>
        <div className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</div>
      </div>
    </div>
    <button onClick={onClearChat} className="p-2 text-gray-500 hover:text-red-500" title="Clear Chat">
      <Brush size={20} />
    </button>
  </div>
);


const Message = React.memo(({ msg, isOwnMessage, onReply, onDelete, onEdit }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const MessageStatus = () => {
    if (!isOwnMessage) return null;
    if (msg.status === 'seen') return <CheckCheck size={16} className="text-blue-400" />;
    if (msg.status === 'delivered') return <CheckCheck size={16} />;
    return <Check size={16} />;
  };

  const renderMessageContent = () => {
    
    const fileUrl = msg.fileUrl; 
    switch (msg.messageType) {
      case 'text':
        return <p className="break-words">{msg.text}</p>;
      case 'image':
        return <img src={fileUrl} alt="chat content" className="rounded-lg max-w-xs h-auto cursor-pointer" onClick={() => window.open(fileUrl, '_blank')} />;
      case 'video':
        return <video controls className="rounded-lg max-w-xs h-auto"><source src={fileUrl} /></video>;
      default:
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg text-gray-800 hover:bg-gray-200">
            <FileText className="text-gray-500" />
            <span className="truncate font-medium">{msg.text || 'Download File'}</span>
          </a>
        );
    }
  };

  return (
    <div className={`group flex items-end gap-2 my-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {isOwnMessage && (
        <div className="relative">
          <button onClick={() => setMenuOpen(p => !p)}><MoreVertical size={18} /></button>
          {menuOpen && (
            <div className="absolute bottom-6 right-0 w-48 bg-white rounded-md shadow-lg border z-10">
              <button onClick={() => { onReply(msg); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"><Reply size={16} /> Reply</button>
              {msg.messageType === 'text' && <button onClick={() => { onEdit(msg); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"><Edit size={16} /> Edit</button>}
              <button onClick={() => { onDelete(msg._id, 'me'); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"><Trash2 size={16} /> Delete for Me</button>
              <button onClick={() => { onDelete(msg._id, 'everyone'); setMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"><Trash2 size={16} /> Delete for Everyone</button>
            </div>
          )}
        </div>
      )}
      <div className={`max-w-xs lg:max-w-md rounded-lg ${isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} ${msg.messageType !== 'text' ? 'p-1' : 'p-2 px-3'}`}>
        {msg.replyTo && (
          <div className="border-l-4 border-blue-200 pl-2 text-sm opacity-80 mb-1">
            <p className="font-bold">{msg.replyTo.senderName}</p>
            <p className="truncate">{msg.replyTo.text || 'File'}</p>
          </div>
        )}
        {renderMessageContent()}
        <div className="flex justify-end items-center gap-2 mt-1 text-xs opacity-70">
          {msg.isEdited && <span>Edited</span>}
          <MessageStatus />
        </div>
      </div>
      {!isOwnMessage && (
        <div className="relative">
          <button onClick={() => onReply(msg)}><Reply size={18} /></button>
        </div>
      )}
    </div>
  );
});

const ChatView = ({ currentUser, selectedChat, onlineUsers, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const otherUser = useMemo(() => {
    if (!selectedChat || !currentUser) return null;
    const partner = selectedChat.members?.find(m => m?._id !== currentUser?._id);
    if (!partner) return null;
    return {
      _id: partner._id,
      name: `${partner.firstName || ''} ${partner.lastName || ''}`.trim(),
      
      profilePic: partner.profile?.avatar?.url ? partner.profile.avatar.url : 'https://placehold.co/48x48/EFEFEF/AAAAAA&text=A'
    };
  }, [selectedChat, currentUser]);

  const isOnline = useMemo(() => otherUser && onlineUsers.includes(otherUser._id), [onlineUsers, otherUser]);

  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_BASE_URL}/api/chat/messages/${selectedChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(data);
        socket.emit('mark_as_seen', { conversationId: selectedChat._id, userId: currentUser._id });
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    const handleNewMessage = (message) => {
        if (message.conversationId === selectedChat._id) {
            setMessages(prev => [...prev, message]);
            if (message.sender._id !== currentUser._id) {
                socket.emit('mark_as_seen', { conversationId: selectedChat._id, userId: currentUser._id });
            }
        }
    };
    const handleMessageDeleted = ({ messageId }) => setMessages(prev => prev.filter(m => m._id !== messageId));
    const handleMessageUpdated = (updatedMessage) => setMessages(prev => prev.map(m => m._id === updatedMessage._id ? updatedMessage : m));
    const handleMessagesSeen = ({ conversationId }) => {
        if (conversationId === selectedChat?._id) {
            setMessages(prev => prev.map(msg => msg.sender?._id === currentUser._id ? { ...msg, status: 'seen' } : msg));
        }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messageDeleted', handleMessageDeleted);
    socket.on('messageUpdated', handleMessageUpdated);
    socket.on('messages_seen', handleMessagesSeen);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messageDeleted', handleMessageDeleted);
      socket.off('messageUpdated', handleMessageUpdated);
      socket.off('messages_seen', handleMessagesSeen);
      setMessages([]);
    };
  }, [selectedChat, currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || !currentUser) return;

    setInput(''); 

    if (editingMessage) {
        setReplyingTo(null);
        setEditingMessage(null);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/chat/edit/${editingMessage._id}`, 
                { newText: trimmedInput },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

        } catch (error) {
            console.error("Failed to edit message:", error);
            alert('Could not edit message.');
        }
    } else {
        const messageData = {
            conversationId: selectedChat._id,
            text: trimmedInput,
            replyTo: replyingTo ? {
                messageId: replyingTo._id,
                text: replyingTo.text || 'File',
                senderName: replyingTo.sender.firstName
            } : null,
        };
        setReplyingTo(null);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/chat/message`, messageData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
    
        } catch (error) {
            console.error("Failed to send message:", error);
            alert('Could not send message.');
        }
    }
  }, [input, selectedChat, currentUser, replyingTo, editingMessage]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedChat) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('chatFile', file); 
    formData.append('conversationId', selectedChat._id);
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/api/chat/file`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (error) {
        console.error("File upload failed:", error);
        alert("File upload failed. Please try again.");
    } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleEditClick = (message) => {
    setEditingMessage(message);
    setInput(message.text);
    setReplyingTo(null);
  };

  const handleDelete = useCallback(async (messageId, type) => {
    try {
        const token = localStorage.getItem('token');
        const url = `${API_BASE_URL}/api/chat/${type}/${messageId}`;
        await axios.delete(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (type === 'me') {
            setMessages(prev => prev.filter(m => m._id !== messageId));
        }
    } catch (error) {
        console.error(`Failed to delete message (type: ${type}):`, error);
        alert('Could not delete message.');
    }
  }, []);

  const handleClearChat = async () => {
    if (!selectedChat) return;
    if (window.confirm("Are you sure you want to clear this chat for yourself? This cannot be undone.")) {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/api/chat/clear/${selectedChat._id}`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear chat:", error);
            alert("Could not clear chat.");
        }
    }
  };

  if (!currentUser || !selectedChat) {
    return <div className="flex items-center justify-center h-full text-gray-400"><p>Select a chat to start messaging.</p></div>;
  }

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <ChatHeader otherUser={otherUser} isOnline={isOnline} onBack={onBack} onClearChat={handleClearChat} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading
          ? <div className="text-center text-gray-500">Loading messages...</div>
          : messages.map(msg => (
            <Message key={msg._id} msg={msg} isOwnMessage={msg.sender?._id === currentUser._id} onReply={setReplyingTo} onDelete={handleDelete} onEdit={handleEditClick} />
          ))}
        {uploading && <div className="text-center text-gray-500">Uploading...</div>}
      </div>

      <div className="p-3 border-t bg-white">
        {(replyingTo || editingMessage) && (
          <div className="p-2 mb-2 bg-gray-100 rounded-lg relative text-sm">
            <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setInput(''); }} className="absolute top-1 right-1 p-1"><X size={16} /></button>
            {replyingTo && <div>Replying to <b>{replyingTo.sender.firstName}</b>: <span className="italic truncate">{replyingTo.text || 'File'}</span></div>}
            {editingMessage && <div><b>Editing Message</b></div>}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-500 hover:text-blue-600"><Paperclip size={24} /></button>
          <input
            type="text"
            className="flex-1 border rounded-full px-4 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
          />
          <button type="submit" className="p-2 text-white bg-blue-600 rounded-full" disabled={!input.trim()}><Send size={24} /></button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;