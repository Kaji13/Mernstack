import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { registerUser } from '../api'
import { saveSession } from '../authStorage'
import './AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor',
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
      const data = await registerUser(form)
      saveSession({ token: data.token, user: data.user })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Registration failed')
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
            <h1>Create your account</h1>
            <p>Register to manage clinic content and settings.</p>
          </div>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@clinic.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                minLength="6"
                required
              />
            </label>

            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {error && <p className="auth-page__error" role="alert">{error}</p>}

            <button className="btn btn--primary auth-page__submit" type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register'}
            </button>
          </form>

          <p className="auth-page__switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </main>
      <BackToTop />
      <Footer />
    </div>
  )
}

export default RegisterPage