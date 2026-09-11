const nodemailer = require('nodemailer')

function getTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

async function sendMail({ to, subject, text, html }) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[mail:dev] to=${to} subject=${subject}\n${text}`)
    return { delivered: false, preview: true }
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Web Clinic <no-reply@webclinic.local>',
    to,
    subject,
    text,
    html,
  })
  return { delivered: true }
}

module.exports = { sendMail }
