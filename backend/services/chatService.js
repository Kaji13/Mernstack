const ChatMessage = require('../models/ChatMessage')
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const Patient = require('../models/Patient')
const Appointment = require('../models/Appointment')

function conversationIdFor(userA, userB) {
  return [String(userA), String(userB)].sort().join(':')
}

async function listMessages(conversationId, userId, limit = 100) {
  const participants = String(conversationId).split(':')
  if (participants.length !== 2 || !participants.includes(String(userId))) {
    const error = new Error('You do not have access to this conversation')
    error.status = 403
    throw error
  }
  return ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).limit(limit)
}

async function saveMessage({ conversationId, senderId, receiverId, senderRole, text }) {
  const receiver = await User.findById(receiverId).select('_id name role')
  const isPatientDoctorChat =
    (senderRole === 'patient' && receiver?.role === 'doctor') ||
    (senderRole === 'doctor' && receiver?.role === 'patient')
  if (!isPatientDoctorChat) {
    const error = new Error('Chat is available only between a patient and a doctor')
    error.status = 403
    throw error
  }

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
    const otherUserId = String(message.senderId) === String(userId)
      ? message.receiverId
      : message.senderId
    const contact = await User.findById(otherUserId).select('_id name role')
    conversations.push({
      conversationId: message.conversationId,
      lastMessage: message.text,
      updatedAt: message.createdAt,
      contact: contact ? { id: contact._id, name: contact.name, role: contact.role } : null,
    })
  }
  return conversations
}

async function listContacts(actor) {
  if (actor.role === 'patient') {
    const [doctorUsers, doctorProfiles] = await Promise.all([
      User.find({ role: 'doctor' }).select('_id name'),
      Doctor.find({ userId: { $ne: null } }).select('userId specialtyLabel'),
    ])
    const profileByUserId = new Map(
      doctorProfiles.map((doctor) => [String(doctor.userId), doctor])
    )
    return doctorUsers.map((doctor) => ({
      id: doctor._id,
      name: doctor.name,
      role: 'doctor',
      subtitle: profileByUserId.get(String(doctor._id))?.specialtyLabel || 'Doctor',
    }))
  }

  if (actor.role === 'doctor') {
    const profile = await Doctor.findOne({ userId: actor._id }).select('slug')
    if (!profile) return []
    const patientIds = await Appointment.distinct('patientId', {
      doctorSlug: profile.slug,
      patientId: { $ne: null },
    })
    const patients = await Patient.find({ _id: { $in: patientIds }, userId: { $ne: null } })
      .select('userId fullName')
    return patients.map((patient) => ({
      id: patient.userId,
      name: patient.fullName,
      role: 'patient',
      subtitle: 'Patient',
    }))
  }

  return []
}

module.exports = { conversationIdFor, listMessages, saveMessage, listConversations, listContacts }
