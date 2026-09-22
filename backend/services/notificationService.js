const Notification = require('../models/Notification')

function publicNotification(notification) {
  const item = notification.toObject ? notification.toObject() : notification
  return { ...item, id: String(item._id || item.id) }
}

async function createNotification(data) {
  return publicNotification(await Notification.create(data))
}

async function listNotifications(userId) {
  const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(100)
  return notifications.map(publicNotification)
}

async function markRead(userId, id) {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: userId },
    { readAt: new Date() },
    { new: true }
  )
  if (!notification) {
    const error = new Error('Notification not found')
    error.status = 404
    throw error
  }
  return publicNotification(notification)
}

async function markAllRead(userId) {
  await Notification.updateMany({ recipientId: userId, readAt: null }, { readAt: new Date() })
  return { message: 'Notifications marked as read' }
}

module.exports = { createNotification, listNotifications, markRead, markAllRead }
