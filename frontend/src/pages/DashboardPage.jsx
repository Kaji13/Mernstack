import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getAppointments, getDashboard, getKhaltiStatus, updateAppointmentStatus } from '../api'
import { clearSession, getSession } from '../authStorage'
import './DashboardPage.css'

function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [stats, setStats] = useState(null)
  const [khalti, setKhalti] = useState(null)
  const [error, setError] = useState('')
  const [appointments, setAppointments] = useState([])
  const [updatingId, setUpdatingId] = useState('')
  const [appointmentFilter, setAppointmentFilter] = useState('pending')
  const [appointmentQuery, setAppointmentQuery] = useState('')
  const canManageAppointments = ['admin', 'editor', 'doctor'].includes(session?.user?.role)

  useEffect(() => {
    if (!session?.token) {
      navigate('/login')
      return
    }
    const requests = [getDashboard(), getKhaltiStatus().catch(() => null)]
    if (canManageAppointments) requests.push(getAppointments())
    Promise.all(requests)
      .then(([dashboard, payment, appointmentList = []]) => {
        setStats(dashboard)
        setKhalti(payment)
        setAppointments(appointmentList)
      })
      .catch((err) => setError(err.message))
  }, [canManageAppointments, navigate, session?.token])

  const changeAppointmentStatus = async (id, status) => {
    setUpdatingId(id)
    setError('')
    try {
      const updated = await updateAppointmentStatus(id, status)
      setAppointments((current) => current.map((item) => (item._id === id ? updated : item)))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId('')
    }
  }

  const visibleAppointments = appointments.filter((appointment) => {
    const matchesStatus = appointmentFilter === 'all' || appointment.status === appointmentFilter
    const query = appointmentQuery.trim().toLowerCase()
    const matchesQuery = !query || [appointment.name, appointment.email, appointment.phone, appointment.department, appointment.doctorName]
      .some((value) => String(value || '').toLowerCase().includes(query))
    return matchesStatus && matchesQuery
  })
  const pendingAppointments = appointments.filter((item) => item.status === 'pending').length

  if (!session?.token) return null

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <div className="dashboard-page__head">
          <div>
            <h1>Clinic dashboard</h1>
            <p>Signed in as {session.user?.name} ({session.user?.role})</p>
          </div>
          <div className="dashboard-page__actions">
            <Link className="btn btn--outline" to="/chat">Patient ↔ doctor chat</Link>
            {session.user?.role === 'doctor' && <Link className="btn btn--outline" to="/doctor">Open doctor portal</Link>}
            {['admin', 'editor', 'doctor'].includes(session.user?.role) && <Link className="btn btn--outline" to="/patients">Manage patients</Link>}
            {['admin', 'editor', 'doctor'].includes(session.user?.role) && <Link className="btn btn--outline" to="/billing">Billing details</Link>}
            {['admin', 'editor'].includes(session.user?.role) && <Link className="btn btn--outline" to="/departments">Manage departments</Link>}
            {session.user?.role === 'admin' && <Link className="btn btn--outline" to="/staff">Manage staff</Link>}
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => {
                clearSession()
                navigate('/login')
              }}
            >
              Log out
            </button>
          </div>
        </div>

        {error && <p className="auth-page__error">{error}</p>}

        {stats && (
          <div className="dashboard-page__grid">
            {Object.entries(stats.counts).map(([key, value]) => (
              <article key={key} className="dashboard-page__card">
                <p>{key}</p>
                <strong>{value}</strong>
              </article>
            ))}
            <article className="dashboard-page__card">
              <p>Revenue</p>
              <strong>Rs {stats.revenue}</strong>
            </article>
          </div>
        )}

        {khalti && (
          <p className="dashboard-page__note">{khalti.message}</p>
        )}

        {canManageAppointments && (
          <section className="dashboard-page__appointments" aria-labelledby="appointment-requests-title">
            <div className="dashboard-page__section-head">
              <div>
                <h2 id="appointment-requests-title">Appointment requests</h2>
                <p>{pendingAppointments ? `${pendingAppointments} request${pendingAppointments === 1 ? '' : 's'} need review.` : 'Your appointment queue is up to date.'}</p>
              </div>
            </div>
            <div className="appointment-tools">
              <label><span className="sr-only">Search appointment requests</span><input value={appointmentQuery} onChange={(event) => setAppointmentQuery(event.target.value)} placeholder="Search patient, doctor, or department" /></label>
              <div className="appointment-filters" role="group" aria-label="Filter appointments">
                {['pending', 'confirmed', 'cancelled', 'all'].map((status) => <button key={status} type="button" className={appointmentFilter === status ? 'appointment-filter appointment-filter--active' : 'appointment-filter'} onClick={() => setAppointmentFilter(status)}>{status[0].toUpperCase() + status.slice(1)} <span>{status === 'all' ? appointments.length : appointments.filter((item) => item.status === status).length}</span></button>)}
              </div>
            </div>
            {appointments.length === 0 ? (
              <p className="dashboard-page__note">No appointment requests yet.</p>
            ) : visibleAppointments.length === 0 ? (
              <p className="dashboard-page__note">No appointments match this view.</p>
            ) : (
              <div className="dashboard-page__appointment-list">
                {visibleAppointments.map((appointment) => (
                  <article className="dashboard-page__appointment" key={appointment._id}>
                    <div>
                      <strong>{appointment.name}</strong>
                      <p>{appointment.doctorName ? `${appointment.doctorName} · ` : ''}{appointment.department} · {new Date(appointment.date).toLocaleDateString()}{appointment.timeSlot ? ` · ${appointment.timeSlot}` : ''}</p>
                      <p>{appointment.email} · {appointment.phone}</p>
                      {appointment.message && <p>{appointment.message}</p>}
                    </div>
                    <div className="dashboard-page__appointment-actions">
                      <span className={`dashboard-page__status dashboard-page__status--${appointment.status}`}>{appointment.status}</span>
                      {appointment.status === 'pending' && (
                        <>
                          <button type="button" className="btn btn--primary" disabled={updatingId === appointment._id} onClick={() => changeAppointmentStatus(appointment._id, 'confirmed')}>
                            Confirm
                          </button>
                          <button type="button" className="btn btn--outline" disabled={updatingId === appointment._id} onClick={() => changeAppointmentStatus(appointment._id, 'cancelled')}>
                            Decline
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default DashboardPage
