import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { forgotPassword } from '../api'
import './AuthPage.css'

function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)
    try {
      const data = await forgotPassword(email)
      setInfo(data.devOtp ? `OTP sent. Dev code: ${data.devOtp}` : 'If that account exists, an OTP was sent.')
      window.setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 800)
    } catch (err) {
      setError(err.message || 'Could not send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-page__main">
        <div className="auth-page__card">
          <div className="auth-page__head">
            <h1>Reset password</h1>
            <p>We will email a 6-digit OTP.</p>
          </div>
          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            {error && <p className="auth-page__error" role="alert">{error}</p>}
            {info && <p className="auth-page__switch">{info}</p>}
            <button className="btn btn--primary auth-page__submit" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
          <p className="auth-page__switch">
            <Link to="/login">Back to login</Link>
          </p>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default ForgotPasswordPage
