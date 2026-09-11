const axios = require('axios')

function getBaseUrl() {
  return process.env.KHALTI_BASE_URL || 'https://dev.khalti.com/api/v2'
}

function isConfigured() {
  return Boolean(process.env.KHALTI_SECRET_KEY)
}

function client() {
  return axios.create({
    baseURL: getBaseUrl(),
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  })
}

async function initiateEpayment(payload) {
  const { data } = await client().post('/epayment/initiate/', payload)
  return data
}

async function lookupEpayment(pidx) {
  const { data } = await client().post('/epayment/lookup/', { pidx })
  return data
}

module.exports = { isConfigured, initiateEpayment, lookupEpayment }
