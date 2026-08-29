const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const pad = (value) => String(value).padStart(2, '0')

function toDateKey(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`
}

function parseDateKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(Date.UTC(year, month - 1, day))
}

function startOfUtcDay(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function addUtcDays(date, amount) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + amount)
  return next
}

function formatSlotLabel(time) {
  const [hourRaw, minute] = time.split(':').map(Number)
  const suffix = hourRaw >= 12 ? 'PM' : 'AM'
  const hour = hourRaw % 12 || 12
  return `${hour}:${pad(minute)} ${suffix}`
}

function buildDoctorSchedule(doctor, bookedKeys, options = {}) {
  const horizon = options.horizon ?? 21
  const startOffset = doctor.available ? 1 : 8
  const workDays = Array.isArray(doctor.workDays) && doctor.workDays.length
    ? doctor.workDays
    : [1, 2, 3, 4, 5]
  const slotTimes = Array.isArray(doctor.slotTimes) && doctor.slotTimes.length
    ? doctor.slotTimes
    : ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  const today = startOfUtcDay()
  const start = addUtcDays(today, startOffset)
  const days = []

  for (let i = 0; i < horizon; i += 1) {
    const date = addUtcDays(start, i)
    const weekday = date.getUTCDay()
    if (!workDays.includes(weekday)) continue

    const dateKey = toDateKey(date)
    const slots = slotTimes.map((time) => {
      const booked = bookedKeys.has(`${dateKey}|${time}`)
      return {
        time,
        label: formatSlotLabel(time),
        available: !booked,
      }
    })

    days.push({
      date: dateKey,
      weekday: WEEKDAYS[weekday],
      label: `${WEEKDAYS[weekday].slice(0, 3)} ${date.getUTCDate()}`,
      month: date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
      openCount: slots.filter((slot) => slot.available).length,
      slots,
    })
  }

  return {
    acceptingNow: Boolean(doctor.available),
    nextOpenDate: days.find((day) => day.openCount > 0)?.date ?? null,
    days,
  }
}

function isValidSlot(doctor, dateKey, time) {
  const date = parseDateKey(dateKey)
  if (!date || !time) return false
  const workDays = doctor.workDays?.length ? doctor.workDays : [1, 2, 3, 4, 5]
  const slotTimes = doctor.slotTimes?.length ? doctor.slotTimes : []
  const startOffset = doctor.available ? 1 : 8
  const earliest = addUtcDays(startOfUtcDay(), startOffset)
  const latest = addUtcDays(earliest, 21)

  return (
    workDays.includes(date.getUTCDay()) &&
    slotTimes.includes(time) &&
    date >= earliest &&
    date <= latest
  )
}

module.exports = {
  buildDoctorSchedule,
  isValidSlot,
  parseDateKey,
  toDateKey,
  formatSlotLabel,
}
