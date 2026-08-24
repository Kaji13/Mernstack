const seedData = require('../data/seedData')
const Service = require('../models/Service')
const ServiceCategory = require('../models/ServiceCategory')
const CareProcessStep = require('../models/CareProcessStep')
const ServiceHighlight = require('../models/ServiceHighlight')
const { isDbConnected } = require('./homeData')

const stripMeta = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  const { __v, createdAt, updatedAt, _id, slug, featuredOnHome, ...rest } = item
  return { id: slug ?? _id?.toString(), ...rest }
}

const stripCategoryMeta = (doc) => {
  const item = doc.toObject ? doc.toObject() : doc
  const { __v, createdAt, updatedAt, _id, slug, ...rest } = item
  return { id: slug ?? _id?.toString(), ...rest }
}

const getSeedServicesData = () => ({
  categories: seedData.serviceCategories.map(({ slug, ...rest }) => ({
    id: slug,
    ...rest,
  })),
  services: seedData.services.map(({ slug, featuredOnHome, ...rest }) => ({
    id: slug,
    ...rest,
  })),
  careProcess: seedData.careProcess.map(({ order, ...rest }) => rest),
  highlights: seedData.serviceHighlights.map(({ order, ...rest }) => rest),
})

async function getServicesData() {
  if (!isDbConnected()) {
    return getSeedServicesData()
  }

  const [categories, services, careProcess, highlights] = await Promise.all([
    ServiceCategory.find().sort({ order: 1 }).lean(),
    Service.find().sort({ order: 1 }).lean(),
    CareProcessStep.find().sort({ order: 1 }).lean(),
    ServiceHighlight.find().sort({ order: 1 }).lean(),
  ])

  const hasData = categories.length || services.length || careProcess.length || highlights.length

  if (!hasData) {
    return getSeedServicesData()
  }

  return {
    categories: categories.length
      ? categories.map(stripCategoryMeta)
      : getSeedServicesData().categories,
    services: services.length ? services.map(stripMeta) : getSeedServicesData().services,
    careProcess: careProcess.length
      ? careProcess.map(({ step, title, description }) => ({ step, title, description }))
      : getSeedServicesData().careProcess,
    highlights: highlights.length
      ? highlights.map(({ icon, title, description }) => ({ icon, title, description }))
      : getSeedServicesData().highlights,
  }
}

module.exports = { getServicesData, stripMeta, stripCategoryMeta }
