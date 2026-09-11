const ChatMessage = require('../models/ChatMessage')

function conversationIdFor(userA, userB) {
  return [String(userA), String(userB)].sort().join(':')
}

async function listMessages(conversationId, limit = 100) {
  return ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).limit(limit)
}

async function saveMessage({ conversationId, senderId, receiverId, senderRole, text }) {
  return ChatMessage.create({
    conversationId: conversationId || conversationIdFor(senderId, receiverId),
    senderId,
    receiverId,
    senderRole,
    text,
  })
}

async function listConversations(userId) {
  const messages = await ChatMessage.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).sort({ createdAt: -1 })

  const seen = new Set()
  const conversations = []
  for (const message of messages) {
    if (seen.has(message.conversationId)) continue
    seen.add(message.conversationId)
    conversations.push(message)
  }
  return conversations
}

module.exports = { conversationIdFor, listMessages, saveMessage, listConversations }
