import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import socket from './socket.js';
import { Trash2, Check, CheckCheck, Download } from 'lucide-react'

const API             = import.meta.env.VITE_API_URL
const fallbackAvatar  = '/placeholders/avatar-placeholder.png'

const ChatPage = ({ currentUser }) => {
  const [conversations, setConversations] = useState([])
  const [currentChat,   setCurrentChat]   = useState(null)
  const [messages,      setMessages]      = useState([])
  const [text,          setText]          = useState('')
  const [onlineUsers,   setOnlineUsers]   = useState([])
  const fileRef   = useRef()
  const bottomRef = useRef()
  const token     = localStorage.getItem('token')

  // 1. Socket events
  useEffect(() => {
    if (!currentUser) return
    socket.emit('addUser', currentUser.id)

    socket.on('getUsers',     setOnlineUsers)
    socket.on('getMessage', data => {
      if (data.conversationId === currentChat?._id) {
        setMessages(prev => [...prev, data])
        markSeen(data.conversationId, data.sender)
      }
    })
    socket.on('messagesSeen', ({ conversationId }) => {
      if (conversationId === currentChat?._id) {
        setMessages(prev =>
          prev.map(m =>
            m.sender === currentUser.id
              ? { ...m, status: 'seen' }
              : m
          )
        )
      }
    })
    socket.on('messageDeleted', ({ conversationId, messageId }) => {
      if (conversationId === currentChat?._id)
        setMessages(prev => prev.filter(m => m._id !== messageId))
    })
    socket.on('chatCleared', ({ conversationId }) => {
      if (conversationId === currentChat?._id)
        setMessages([])
    })

    return () => socket.removeAllListeners()
  }, [currentUser, currentChat])

  // 2. Load conversations
  useEffect(() => {
    if (!token) return
    axios.get(`${API}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setConversations(res.data))
  }, [token])

  // 3. Load messages for selected chat
  useEffect(() => {
    if (!currentChat) return
    axios.get(`${API}/api/chat/messages/${currentChat._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setMessages(res.data)
      markSeen(currentChat._id, currentChat.otherUser._id)
    })
  }, [currentChat, token])

  // 4. Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Helpers
  const markSeen = async (conversationId, receiverId) => {
    await axios.put(`${API}/api/chat/messages/seen`, { conversationId }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    socket.emit('seenMessages', { conversationId, receiverId })
  }

  const handleSend = async e => {
    e.preventDefault()
    const files = fileRef.current.files
    if (!text.trim() && files.length === 0) return

    const formData = new FormData()
    formData.append('conversationId', currentChat._id)
    formData.append('receiverId',   currentChat.otherUser._id)
    formData.append('text',         text)
    Array.from(files).forEach(f => formData.append('files', f))

    const { data } = await axios.post(`${API}/api/chat/messages`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    socket.emit('sendMessage', { ...data, receiverId: currentChat.otherUser._id })
    setMessages(prev => [...prev, data])
    setText('')
    fileRef.current.value = null
  }

  const handleDelete = async id => {
    await axios.delete(`${API}/api/chat/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    socket.emit('deleteMessage', { conversationId: currentChat._id, messageId: id })
  }

  const handleClear = async () => {
    if (!window.confirm('Clear this conversation?')) return
    await axios.delete(`${API}/api/chat/conversation/${currentChat._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    socket.emit('clearChat', { conversationId: currentChat._id })
    setMessages([])
  }

  const isOnline = () =>
    onlineUsers.some(u => u.userId === currentChat?.otherUser._id)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 border-r overflow-y-auto">
        <div className="p-4 font-bold text-lg">Chats</div>
        {conversations.map(conv => (
          <div
            key={conv._id}
            onClick={() => setCurrentChat(conv)}
            className={`flex items-center p-3 cursor-pointer border-b hover:bg-gray-100 ${
              conv._id === currentChat?._id ? 'bg-blue-50' : ''
            }`}
          >
            <img
              src={
                conv.otherUser.profile?.avatar
                  ? `${API}${conv.otherUser.profile.avatar}`
                  : fallbackAvatar
              }
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = fallbackAvatar
              }}
              alt="avatar"
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="font-semibold truncate">
                {conv.otherUser.firstName} {conv.otherUser.lastName}
              </div>
              <div className="text-sm text-gray-500 truncate">
                {conv.lastMessage}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={
                currentChat?.otherUser.profile?.avatar
                  ? `${API}${currentChat.otherUser.profile.avatar}`
                  : fallbackAvatar
              }
              onError={e => {
                e.currentTarget.onerror = null
                e.currentTarget.src = fallbackAvatar
              }}
              alt="avatar"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">
                {currentChat?.otherUser.firstName} {currentChat?.otherUser.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {isOnline()
                  ? 'Online'
                  : `Last seen ${
                      new Date(currentChat?.updatedAt).toLocaleTimeString([], {
                        hour:   '2-digit',
                        minute: '2-digit'
                      })
                    }`}
              </div>
            </div>
          </div>
          {currentChat && (
            <button onClick={handleClear} className="text-red-500">
              Clear Chat
            </button>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {messages.map((msg, idx) => {
            const own = msg.sender === currentUser.id
            return (
              <div
                key={msg._id || idx}
                ref={idx === messages.length - 1 ? bottomRef : null}
                className={`flex mb-4 ${
                  own ? 'justify-end' : 'justify-start'
                } group`}
              >
                {own && (
                  <button
                    onClick={() => handleDelete(msg._id)}
                    className="mr-2 text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                <div
                  className={`p-3 rounded-lg max-w-md ${
                    own
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-800'
                  }`}
                >
                  {msg.text && <p>{msg.text}</p>}
                  {msg.files?.map((file, i) => (
                    <div key={i} className="mt-2 relative">
                      <a
                        href={`${API}${file.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-sm"
                      >
                        {file.fileName}
                      </a>
                      <button
                        onClick={() =>
                          window.open(`${API}${file.url}`, '_blank')
                        }
                        className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center justify-end text-xs mt-1">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour:   '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {own && (
                      <span className="ml-1">
                        {msg.status === 'seen' ? (
                          <CheckCheck size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {currentChat && (
          <form
            onSubmit={handleSend}
            className="flex items-center p-4 border-t gap-2 bg-white"
          >
            <input
              type="text"
              className="flex-grow border rounded-full px-4 py-2 focus:outline-none"
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <input type="file" multiple ref={fileRef} />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              Send
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ChatPage
