require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../config/db')
const seedData = require('../data/seedData')
const Service = require('../models/Service')
const ServiceCategory = require('../models/ServiceCategory')
const CareProcessStep = require('../models/CareProcessStep')
const ServiceHighlight = require('../models/ServiceHighlight')
const Doctor = require('../models/Doctor')
const DoctorSpecialty = require('../models/DoctorSpecialty')
const DoctorHighlight = require('../models/DoctorHighlight')
const DoctorVisitStep = require('../models/DoctorVisitStep')
const Statistic = require('../models/Statistic')
const Testimonial = require('../models/Testimonial')
const FAQ = require('../models/FAQ')
const GalleryItem = require('../models/GalleryItem')
const ClinicInfo = require('../models/ClinicInfo')

async function seed() {
  await connectDB()

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required to seed the database.')
    process.exit(1)
  }

  await Promise.all([
    Service.deleteMany(),
    ServiceCategory.deleteMany(),
    CareProcessStep.deleteMany(),
    ServiceHighlight.deleteMany(),
    Doctor.deleteMany(),
    DoctorSpecialty.deleteMany(),
    DoctorHighlight.deleteMany(),
    DoctorVisitStep.deleteMany(),
    Statistic.deleteMany(),
    Testimonial.deleteMany(),
    FAQ.deleteMany(),
    GalleryItem.deleteMany(),
    ClinicInfo.deleteMany(),
  ])

  await ClinicInfo.create(seedData.clinic)
  await Service.insertMany(seedData.services)
  await ServiceCategory.insertMany(seedData.serviceCategories)
  await CareProcessStep.insertMany(seedData.careProcess)
  await ServiceHighlight.insertMany(seedData.serviceHighlights)
  await Doctor.insertMany(seedData.doctors)
  await DoctorSpecialty.insertMany(seedData.doctorSpecialties)
  await DoctorHighlight.insertMany(seedData.doctorHighlights)
  await DoctorVisitStep.insertMany(seedData.doctorVisitSteps)
  await Statistic.insertMany(seedData.statistics)
  await Testimonial.insertMany(seedData.testimonials)
  await FAQ.insertMany(seedData.faqs)
  await GalleryItem.insertMany(seedData.gallery)

  console.log('Database seeded with home, services, and doctors page content.')
  await mongoose.disconnect()
}

seed().catch((error) => {
  console.error('Seed failed:', error.message)
  process.exit(1)
})
