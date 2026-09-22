import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../api'
import './DashboardPage.css'

function idOf(notification) {
  return notification.id || notification._id
}

function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getNotifications()
      .then(setNotifications)
      .catch((err) => setError(err.message || 'Unable to load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  async function readNotification(notification) {
    if (notification.readAt) return
    try {
      const updated = await markNotificationRead(idOf(notification))
      setNotifications((current) => current.map((item) => idOf(item) === idOf(updated) ? updated : item))
    } catch (err) {
      setError(err.message || 'Unable to update this notification.')
    }
  }

  async function readAll() {
    setUpdating(true)
    setError('')
    try {
      await markAllNotificationsRead()
      const now = new Date().toISOString()
      setNotifications((current) => current.map((item) => item.readAt ? item : { ...item, readAt: now }))
    } catch (err) {
      setError(err.message || 'Unable to mark notifications as read.')
    } finally {
      setUpdating(false)
    }
  }

  const unread = notifications.filter((item) => !item.readAt).length

  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Notifications</h1><p>{unread ? `${unread} unread notification${unread === 1 ? '' : 's'}` : 'You are all caught up.'}</p></div><div className="dashboard-page__actions"><button type="button" className="btn btn--outline" disabled={!unread || updating} onClick={readAll}>{updating ? 'Updating…' : 'Mark all read'}</button><Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link></div></div>
    {error && <p className="auth-page__error" role="alert">{error}</p>}
    {loading ? <p className="dashboard-page__note">Loading notifications…</p> : notifications.length === 0 ? <p className="dashboard-page__note">No notifications yet.</p> : <div className="notification-list">{notifications.map((notification) => <article className={`notification-item ${notification.readAt ? '' : 'notification-item--unread'}`} key={idOf(notification)}><div><strong>{notification.title}</strong><p>{notification.body}</p><small>{new Date(notification.createdAt).toLocaleString()}</small></div><div className="notification-item__actions">{notification.link && <Link className="btn btn--outline" to={notification.link} onClick={() => readNotification(notification)}>Open</Link>}{!notification.readAt && <button className="btn btn--primary" type="button" onClick={() => readNotification(notification)}>Mark read</button>}</div></article>)}</div>}
  </main><BackToTop /><Footer /></div>
}

export default NotificationsPage
