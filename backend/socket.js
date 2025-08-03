let onlineUsers = []

const addUser = (userId, socketId) => {
  if (!onlineUsers.some(u => u.userId === userId)) {
    onlineUsers.push({ userId, socketId })
  }
}

const removeUser = socketId => {
  onlineUsers = onlineUsers.filter(u => u.socketId !== socketId)
}

const getUser = userId => onlineUsers.find(u => u.userId === userId)

export default function initSocket(io) {
  io.on('connection', socket => {
    console.log('🟢 Socket connected:', socket.id)

    socket.on('addUser', userId => {
      addUser(userId, socket.id)
      io.emit('getUsers', onlineUsers)
    })

    socket.on('sendMessage', data => {
      const receiver = getUser(data.receiverId)
      if (receiver) io.to(receiver.socketId).emit('getMessage', data)
    })

    socket.on('seenMessages', ({ conversationId, receiverId }) => {
      const receiver = getUser(receiverId)
      if (receiver) io.to(receiver.socketId).emit('messagesSeen', { conversationId })
    })

    socket.on('deleteMessage', ({ conversationId, messageId }) => {
      onlineUsers.forEach(u =>
        io.to(u.socketId).emit('messageDeleted', { conversationId, messageId })
      )
    })

    socket.on('clearChat', ({ conversationId }) => {
      onlineUsers.forEach(u =>
        io.to(u.socketId).emit('chatCleared', { conversationId })
      )
    })

    socket.on('disconnect', () => {
      removeUser(socket.id)
      io.emit('getUsers', onlineUsers)
    })
  })
}
