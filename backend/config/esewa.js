const axios = require('axios')
const crypto = require('crypto')

const UAT_FORM_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
const LIVE_FORM_URL = 'https://epay.esewa.com.np/api/epay/main/v2/form'
const UAT_STATUS_URL = 'https://rc.esewa.com.np/api/epay/transaction/status/'
const LIVE_STATUS_URL = 'https://esewa.com.np/api/epay/transaction/status/'

function isLive() {
  return String(process.env.ESEWA_ENVIRONMENT || '').toLowerCase() === 'live'
}

function isConfigured() {
  return Boolean(process.env.ESEWA_SECRET_KEY && process.env.ESEWA_PRODUCT_CODE)
}

function getFormUrl() {
  return process.env.ESEWA_FORM_URL || (isLive() ? LIVE_FORM_URL : UAT_FORM_URL)
}

function getStatusUrl() {
  return process.env.ESEWA_STATUS_URL || (isLive() ? LIVE_STATUS_URL : UAT_STATUS_URL)
}

function sign(fields) {
  const message = Object.entries(fields).map(([key, value]) => `${key}=${value}`).join(',')
  return crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY).update(message).digest('base64')
}

function formatAmount(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value) || value < 0) throw new Error('eSewa amount must be a non-negative number')
  return String(value)
}

function buildPaymentForm({ amount, transactionUuid, successUrl, failureUrl }) {
  const signedFieldNames = 'total_amount,transaction_uuid,product_code'
  const totalAmount = formatAmount(amount)
  const formData = {
    amount: totalAmount,
    tax_amount: '0',
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
    product_code: process.env.ESEWA_PRODUCT_CODE,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: signedFieldNames,
  }
  formData.signature = sign({
    total_amount: formData.total_amount,
    transaction_uuid: formData.transaction_uuid,
    product_code: formData.product_code,
  })
  return formData
}

async function lookupPayment({ amount, transactionUuid }) {
  const { data } = await axios.get(getStatusUrl(), {
    params: {
      product_code: process.env.ESEWA_PRODUCT_CODE,
      total_amount: formatAmount(amount),
      transaction_uuid: transactionUuid,
    },
    timeout: 15000,
  })
  return data
}

module.exports = { isConfigured, getFormUrl, buildPaymentForm, lookupPayment }
