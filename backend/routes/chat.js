const express = require('express')
const { authenticate } = require('../middleware/auth')
const chatService = require('../services/chatService')

const router = express.Router()

router.use(authenticate)

router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await chatService.listConversations(req.user._id)
    res.json(conversations)
  } catch (error) {
    next(error)
  }
})

router.get('/contacts', async (req, res, next) => {
  try {
    const contacts = await chatService.listContacts(req.user)
    res.json(contacts)
  } catch (error) {
    next(error)
  }
})

router.get('/:conversationId', async (req, res, next) => {
  try {
    const messages = await chatService.listMessages(req.params.conversationId, req.user._id)
    res.json(messages)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { receiverId, text, conversationId } = req.body
    if (!receiverId || !text) {
      return res.status(400).json({ message: 'receiverId and text are required' })
    }
    const message = await chatService.saveMessage({
      conversationId,
      senderId: req.user._id,
      receiverId,
      senderRole: req.user.role,
      text,
    })
    const io = req.app.get('io')
    io?.to(message.conversationId).emit('chat:message', message)
    io?.to(String(message.receiverId)).emit('chat:message', message)
    res.status(201).json(message)
  } catch (error) {
    next(error)
  }
})

module.exports = router
