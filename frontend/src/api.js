const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

function toQuery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

export function getHomeData() {
  return request('/home')
}

export function getDoctorsData(params) {
  return request(`/doctors${toQuery(params)}`)
}

export function getDoctorSchedule(slug) {
  return request(`/doctors/${slug}/schedule`)
}

export function joinDoctorWaitlist(slug, payload) {
  return request(`/doctors/${slug}/waitlist`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function createAppointment(payload) {
  return request('/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function registerUser(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function loginUser(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
