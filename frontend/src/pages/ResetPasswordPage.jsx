import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { resetPassword } from '../api'
import './AuthPage.css'

function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    email: params.get('email') || '',
    code: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(form)
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Reset failed')
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
            <h1>Set a new password</h1>
            <p>Enter the OTP from your email.</p>
          </div>
          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              OTP
              <input name="code" value={form.code} onChange={handleChange} minLength="6" maxLength="6" required />
            </label>
            <label>
              New password
              <input type="password" name="password" value={form.password} onChange={handleChange} minLength="6" required />
            </label>
            {error && <p className="auth-page__error" role="alert">{error}</p>}
            <button className="btn btn--primary auth-page__submit" type="submit" disabled={loading}>
              {loading ? 'Updating…' : 'Update password'}
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

export default ResetPasswordPage
