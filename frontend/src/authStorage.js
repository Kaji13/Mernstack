export function getSession() {
  try {
    const raw = localStorage.getItem('cms_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem('cms_session', JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem('cms_session')
}