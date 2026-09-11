const User = require('../models/User')
const RefreshToken = require('../models/RefreshToken')
const Otp = require('../models/Otp')
const Patient = require('../models/Patient')
const Doctor = require('../models/Doctor')
const Department = require('../models/Department')
const Appointment = require('../models/Appointment')
const MedicalRecord = require('../models/MedicalRecord')
const Billing = require('../models/Billing')
const Payment = require('../models/Payment')
const ChatMessage = require('../models/ChatMessage')
const FileUpload = require('../models/FileUpload')

function repo(Model) {
  return {
    create(data) {
      return Model.create(data)
    },
    findMany(where = {}, options = {}) {
      let query = Model.find(where)
      if (options.sort) query = query.sort(options.sort)
      if (options.populate) query = query.populate(options.populate)
      if (options.limit) query = query.limit(options.limit)
      if (options.skip) query = query.skip(options.skip)
      return query
    },
    findUnique(where) {
      if (where.id || where._id) return Model.findById(where.id || where._id)
      return Model.findOne(where)
    },
    update(where, data) {
      return Model.findByIdAndUpdate(where.id || where._id, data, {
        new: true,
        runValidators: true,
      })
    },
    delete(where) {
      return Model.findByIdAndDelete(where.id || where._id)
    },
    count(where = {}) {
      return Model.countDocuments(where)
    },
    model: Model,
  }
}

const prisma = {
  user: repo(User),
  refreshToken: repo(RefreshToken),
  otp: repo(Otp),
  patient: repo(Patient),
  doctor: repo(Doctor),
  department: repo(Department),
  appointment: repo(Appointment),
  medicalRecord: repo(MedicalRecord),
  billing: repo(Billing),
  payment: repo(Payment),
  chatMessage: repo(ChatMessage),
  fileUpload: repo(FileUpload),
}

module.exports = prisma
