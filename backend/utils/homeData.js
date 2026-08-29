const mongoose = require('mongoose')
const seedData = require('../data/seedData')
const Service = require('../models/Service')
const Doctor = require('../models/Doctor')
const Statistic = require('../models/Statistic')
const Testimonial = require('../models/Testimonial')
const FAQ = require('../models/FAQ')
const GalleryItem = require('../models/GalleryItem')
const ClinicInfo = require('../models/ClinicInfo')

const isDbConnected = () => mongoose.connection.readyState === 1

const sortByOrder = (items) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

const stripMeta = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  const { __v, createdAt, updatedAt, _id, ...rest } = item
  return { id: _id?.toString(), ...rest }
}

const toHomeDoctor = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  return {
    id: item.slug ?? item._id?.toString(),
    slug: item.slug,
    name: item.name,
    specialty: item.specialtyLabel || item.specialty,
    experience: item.experience,
    initials: item.initials,
    rating: item.rating,
    available: item.available,
  }
}

const toHomeService = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  const { slug, icon, title, description, order } = item
  return { id: slug ?? item._id?.toString(), icon, title, description, order }
}

const getHomeServicesFromSeed = () =>
  seedData.services
    .filter((service) => service.featuredOnHome)
    .map(({ slug, icon, title, description, order }) => ({
      id: slug,
      icon,
      title,
      description,
      order,
    }))

const getSeedHomeData = () => ({
  clinic: seedData.clinic,
  services: getHomeServicesFromSeed(),
    doctors: seedData.doctors.filter((doctor) => doctor.featured !== false).map(toHomeDoctor),
  statistics: seedData.statistics,
  testimonials: seedData.testimonials,
  faqs: seedData.faqs,
  gallery: seedData.gallery,
})

async function getHomeData() {
  if (!isDbConnected()) {
    return getSeedHomeData()
  }

  const [clinicDoc, services, doctors, statistics, testimonials, faqs, gallery] =
    await Promise.all([
      ClinicInfo.findOne().lean(),
      Service.find({ featuredOnHome: true }).sort({ order: 1 }).lean(),
      Doctor.find({ featured: true }).sort({ order: 1 }).lean(),
      Statistic.find().sort({ order: 1 }).lean(),
      Testimonial.find().sort({ order: 1 }).lean(),
      FAQ.find().sort({ order: 1 }).lean(),
      GalleryItem.find().sort({ order: 1 }).lean(),
    ])

  const hasData =
    clinicDoc ||
    services.length ||
    doctors.length ||
    statistics.length ||
    testimonials.length ||
    faqs.length ||
    gallery.length

  if (!hasData) {
    return getSeedHomeData()
  }

  return {
    clinic: clinicDoc
      ? {
          ...clinicDoc,
          id: clinicDoc._id.toString(),
          _id: undefined,
          __v: undefined,
        }
      : seedData.clinic,
    services: services.length ? services.map(toHomeService) : getHomeServicesFromSeed(),
    doctors: doctors.length
      ? doctors.map(toHomeDoctor)
      : seedData.doctors.filter((doctor) => doctor.featured !== false).map(toHomeDoctor),
    statistics: statistics.length ? statistics.map(stripMeta) : seedData.statistics,
    testimonials: testimonials.length ? testimonials.map(stripMeta) : seedData.testimonials,
    faqs: faqs.length ? faqs.map(stripMeta) : seedData.faqs,
    gallery: gallery.length ? gallery.map(stripMeta) : seedData.gallery,
  }
}

module.exports = { getHomeData, sortByOrder, isDbConnected }
