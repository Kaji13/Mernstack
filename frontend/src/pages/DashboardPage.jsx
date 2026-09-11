import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { getDashboard, getKhaltiStatus } from '../api'
import { clearSession, getSession } from '../authStorage'
import './DashboardPage.css'

function DashboardPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [stats, setStats] = useState(null)
  const [khalti, setKhalti] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session?.token) {
      navigate('/login')
      return
    }
    Promise.all([getDashboard(), getKhaltiStatus().catch(() => null)])
      .then(([dashboard, payment]) => {
        setStats(dashboard)
        setKhalti(payment)
      })
      .catch((err) => setError(err.message))
  }, [navigate, session?.token])

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
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default DashboardPage
