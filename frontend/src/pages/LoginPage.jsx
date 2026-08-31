import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { loginUser } from '../api'
import { saveSession } from '../authStorage'
import './AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
      const data = await loginUser(form)
      saveSession({ token: data.token, user: data.user })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
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
            <h1>Welcome back</h1>
            <p>Log in to manage your clinic.</p>
          </div>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@clinic.com"
                required
                autoFocus
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Your password"
                required
              />
            </label>

            {error && <p className="auth-page__error" role="alert">{error}</p>}

            <button className="btn btn--primary auth-page__submit" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <p className="auth-page__switch">
            No account yet? <Link to="/register">Register</Link>
          </p>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default LoginPage