export function getSession() {
  try {
    const raw = localStorage.getItem('cms_session')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveSession(session) {
  const normalized = {
    ...session,
    token: session.accessToken || session.token,
    accessToken: session.accessToken || session.token,
    refreshToken: session.refreshToken || '',
    user: session.user,
  }
  localStorage.setItem('cms_session', JSON.stringify(normalized))
}

export function clearSession() {
  localStorage.removeItem('cms_session')
}
