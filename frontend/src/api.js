import { clearSession, getSession, saveSession } from './authStorage'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

function authHeaders() {
  const session = getSession()
  const token = session?.accessToken || session?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parse(response) {
  return response.json().catch(() => ({}))
}

async function refreshSession() {
  const session = getSession()
  if (!session?.refreshToken) return null
  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
  const data = await parse(response)
  if (!response.ok) {
    clearSession()
    return null
  }
  saveSession({
    ...session,
    token: data.accessToken || data.token,
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
    user: data.user || session.user,
  })
  return data
}

async function request(path, options = {}, retry = true) {
  const isForm = options.body instanceof FormData
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders(),
      ...options.headers,
    },
  })

  if (response.status === 401 && retry && getSession()?.refreshToken) {
    const refreshed = await refreshSession()
    if (refreshed) return request(path, options, false)
  }

  const data = await parse(response)
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

export function forgotPassword(email) {
  return request('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function resetPassword(payload) {
  return request('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getDashboard() {
  return request('/dashboard')
}

export function getChatConversations() {
  return request('/chat/conversations')
}

export function getChatMessages(conversationId) {
  return request(`/chat/${conversationId}`)
}

export function sendChatMessage(payload) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function verifyKhaltiPayment(pidx) {
  return request('/payments/khalti/verify', {
    method: 'POST',
    body: JSON.stringify({ pidx }),
  })
}

export function getKhaltiStatus() {
  return request('/payments/khalti/status')
}
