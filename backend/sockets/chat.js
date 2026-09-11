const { Server } = require('socket.io')
const User = require('../models/User')
const { verifyAccessToken } = require('../utils/tokens')
const chatService = require('../services/chatService')

function attachSockets(httpServer, origin) {
  const io = new Server(httpServer, {
    cors: { origin, methods: ['GET', 'POST'] },
  })

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token
      if (!token) return next(new Error('Access token required'))
      const payload = verifyAccessToken(token)
      const user = await User.findById(payload.id)
      if (!user) return next(new Error('User not found'))
      socket.user = user
      next()
    } catch (error) {
      next(new Error('Invalid or expired access token'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(String(socket.user._id))

    socket.on('chat:join', ({ conversationId, receiverId }) => {
      const room = conversationId || chatService.conversationIdFor(socket.user._id, receiverId)
      if (room) socket.join(room)
    })

    socket.on('chat:message', async (payload, ack) => {
      try {
        const { receiverId, text, conversationId } = payload || {}
        if (!receiverId || !text) throw new Error('receiverId and text are required')
        const message = await chatService.saveMessage({
          conversationId,
          senderId: socket.user._id,
          receiverId,
          senderRole: socket.user.role,
          text,
        })
        io.to(message.conversationId).emit('chat:message', message)
        io.to(String(receiverId)).emit('chat:message', message)
        if (typeof ack === 'function') ack({ ok: true, message })
      } catch (error) {
        if (typeof ack === 'function') ack({ ok: false, message: error.message })
      }
    })
  })

  return io
}

module.exports = { attachSockets }
