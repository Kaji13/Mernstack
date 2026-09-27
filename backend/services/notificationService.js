const mongoose = require('mongoose')
const Notification = require('../models/Notification')

const LIST_LIMIT = 100
const PUBLIC_FIELDS = '_id recipientId type title body link metadata readAt createdAt updatedAt'

function publicNotification(notification) {
  const item = notification.toObject ? notification.toObject() : notification
  return { ...item, id: String(item._id || item.id) }
}

async function createNotification(data) {
  return publicNotification(await Notification.create(data))
}

async function listNotifications(userId) {
  const notifications = await Notification.find({ recipientId: userId })
    .select(PUBLIC_FIELDS)
    .sort({ createdAt: -1, _id: -1 })
    .limit(LIST_LIMIT)
    .lean()
  return notifications.map(publicNotification)
}

async function markRead(userId, id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error('Notification not found')
    error.status = 404
    throw error
  }
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: userId, readAt: null },
    { readAt: new Date() },
    { new: true, projection: PUBLIC_FIELDS }
  )
  if (!notification) {
    const alreadyRead = await Notification.findOne({ _id: id, recipientId: userId })
      .select(PUBLIC_FIELDS)
      .lean()
    if (alreadyRead) return publicNotification(alreadyRead)
    const error = new Error('Notification not found')
    error.status = 404
    throw error
  }
  return publicNotification(notification)
}

async function markAllRead(userId) {
  const result = await Notification.updateMany(
    { recipientId: userId, readAt: null },
    { $set: { readAt: new Date() } }
  )
  return { message: 'Notifications marked as read', updatedCount: result.modifiedCount }
}

module.exports = { createNotification, listNotifications, markRead, markAllRead }
