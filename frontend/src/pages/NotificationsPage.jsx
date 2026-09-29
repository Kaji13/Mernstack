import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { io } from 'socket.io-client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api'
import { getSession } from '../authStorage'
import './DashboardPage.css'

function idOf(notification) {
  return String(notification.id || notification._id)
}

function NotificationsPage() {
  const session = getSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingAll, setUpdatingAll] = useState(false)
  const [pendingIds, setPendingIds] = useState(() => new Set())
  const [filter, setFilter] = useState('all')
  const [liveConnected, setLiveConnected] = useState(false)
  const socketUrl = useMemo(() => import.meta.env.VITE_SOCKET_URL || window.location.origin, [])

  useEffect(() => {
    let mounted = true
    getNotifications()
      .then((items) => { if (mounted) setNotifications(items) })
      .catch((err) => { if (mounted) setError(err.message || 'Unable to load notifications.') })
      .finally(() => { if (mounted) setLoading(false) })

    if (!session?.token) return () => { mounted = false }
    const socket = io(socketUrl, {
      auth: { token: session.accessToken || session.token },
      transports: ['websocket', 'polling'],
    })
    socket.on('connect', () => setLiveConnected(true))
    socket.on('disconnect', () => setLiveConnected(false))
    socket.on('connect_error', () => setLiveConnected(false))
    socket.on('notification:new', (notification) => {
      setNotifications((current) => {
        if (current.some((item) => idOf(item) === idOf(notification))) return current
        return [notification, ...current].slice(0, 100)
      })
    })
    return () => { mounted = false; socket.disconnect() }
  }, [session?.token, session?.accessToken, socketUrl])

  async function readNotification(notification) {
    if (notification.readAt || pendingIds.has(idOf(notification))) return
    const id = idOf(notification)
    const previous = notifications.find((item) => idOf(item) === id)
    const readAt = new Date().toISOString()
    setError('')
    setPendingIds((current) => new Set(current).add(id))
    setNotifications((current) => current.map((item) => idOf(item) === id ? { ...item, readAt } : item))
    try {
      const updated = await markNotificationRead(id)
      setNotifications((current) => current.map((item) => idOf(item) === id ? updated : item))
    } catch (err) {
      setNotifications((current) => current.map((item) => idOf(item) === id ? previous : item))
      setError(err.message || 'Unable to update this notification.')
    } finally {
      setPendingIds((current) => { const next = new Set(current); next.delete(id); return next })
    }
  }

  async function readAll() {
    if (!unreadCount || updatingAll) return
    const previousReadAt = new Map(notifications.map((item) => [idOf(item), item.readAt]))
    const readAt = new Date().toISOString()
    setUpdatingAll(true)
    setError('')
    setNotifications((current) => current.map((item) => item.readAt ? item : { ...item, readAt }))
    try {
      await markAllNotificationsRead()
    } catch (err) {
      setNotifications((current) => current.map((item) => previousReadAt.has(idOf(item))
        ? { ...item, readAt: previousReadAt.get(idOf(item)) }
        : item))
      setError(err.message || 'Unable to mark notifications as read.')
    } finally {
      setUpdatingAll(false)
    }
  }

  const unreadCount = notifications.reduce((count, item) => count + (item.readAt ? 0 : 1), 0)
  const visibleNotifications = filter === 'unread'
    ? notifications.filter((item) => !item.readAt)
    : notifications

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <div className="dashboard-page__head">
          <div>
            <h1>Notifications</h1>
            <p>{unreadCount ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'You are all caught up.'}</p>
          </div>
          <div className="dashboard-page__actions">
            <button type="button" className="btn btn--outline" disabled={!unreadCount || updatingAll} onClick={readAll}>
              {updatingAll ? 'Updating…' : 'Mark all read'}
            </button>
            <Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link>
          </div>
        </div>
        <div className="notification-toolbar" role="group" aria-label="Filter notifications">
          <button type="button" className={filter === 'all' ? 'notification-filter notification-filter--active' : 'notification-filter'} onClick={() => setFilter('all')}>All <span>{notifications.length}</span></button>
          <button type="button" className={filter === 'unread' ? 'notification-filter notification-filter--active' : 'notification-filter'} onClick={() => setFilter('unread')}>Unread <span>{unreadCount}</span></button>
          <span className={`notification-toolbar__live ${liveConnected ? 'notification-toolbar__live--connected' : ''}`} role="status"><i /> {liveConnected ? 'Live updates connected' : 'Live updates reconnecting'}</span>
        </div>
        {error && <p className="auth-page__error" role="alert">{error}</p>}
        {loading ? <p className="dashboard-page__note">Loading notifications…</p> : visibleNotifications.length === 0 ? (
          <div className="notification-empty"><span aria-hidden="true">✓</span><h2>{filter === 'unread' ? 'You’re all caught up' : 'No notifications yet'}</h2><p>{filter === 'unread' ? 'New unread updates will show here.' : 'Updates from your care team will show here.'}</p></div>
        ) : (
          <div className="notification-list">
            {visibleNotifications.map((notification) => {
              const id = idOf(notification)
              const date = new Date(notification.createdAt)
              return (
                <article className={`notification-item ${notification.readAt ? '' : 'notification-item--unread'}`} key={id}>
                  <span className={`notification-item__mark ${notification.readAt ? '' : 'notification-item__mark--unread'}`} aria-hidden="true">{notification.type === 'chat' ? '✉' : '•'}</span>
                  <div className="notification-item__content">
                    <div className="notification-item__title"><strong>{notification.title}</strong>{!notification.readAt && <span>New</span>}</div>
                    <p>{notification.body}</p>
                    <time dateTime={notification.createdAt}>{Number.isNaN(date.getTime()) ? '' : date.toLocaleString()}</time>
                  </div>
                  <div className="notification-item__actions">
                    {notification.link && <Link className="btn btn--outline" to={notification.link} onClick={() => readNotification(notification)}>Open</Link>}
                    {!notification.readAt && <button className="btn btn--primary" type="button" disabled={pendingIds.has(id)} onClick={() => readNotification(notification)}>{pendingIds.has(id) ? 'Saving…' : 'Mark read'}</button>}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default NotificationsPage
