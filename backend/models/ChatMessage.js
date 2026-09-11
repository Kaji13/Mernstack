const mongoose = require('mongoose')

const chatMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['patient', 'doctor', 'admin', 'editor'], required: true },
    text: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
)

chatMessageSchema.index({ conversationId: 1, createdAt: 1 })

module.exports = mongoose.model('ChatMessage', chatMessageSchema)
