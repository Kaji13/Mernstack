import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { sendVerificationEmail, verifyEmail } from '../api'
import Navbar from './Navbar'
import Footer from './Footer'
import BackToTop from './BackToTop'
import '../pages/AuthPage.css'

function VerifyEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') || '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter the email address you used to register.')
      return
    }
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your email.')
      return
    }
    setVerifying(true)
    try {
      await verifyEmail(email, code)
      setNotice('Your email has been verified. You can now log in.')
      window.setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      setError(err.message || 'The verification code could not be confirmed.')
    } finally {
      setVerifying(false)
    }
  }

  async function resend() {
    setError('')
    setNotice('')
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Enter a valid email address before resending.')
      return
    }
    setResending(true)
    try {
      const result = await sendVerificationEmail(email)
      setNotice(result.devOtp ? `A new code was sent. Development code: ${result.devOtp}` : 'A new verification code has been sent.')
    } catch (err) {
      setError(err.message || 'We could not resend the code.')
    } finally {
      setResending(false)
    }
  }

  return <div className="auth-page"><Navbar /><main className="auth-page__main"><div className="auth-page__card">
    <div className="auth-page__head"><h1>Verify your email</h1><p>Enter the six-digit code we sent to your inbox. It expires in 10 minutes.</p></div>
    <form className="auth-page__form" noValidate onSubmit={submit}>
      <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      <label>Verification code<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required /></label>
      {error && <p className="auth-page__error" role="alert">{error}</p>}
      {notice && <p className="auth-page__success" role="status">{notice}</p>}
      <button className="btn btn--primary auth-page__submit" type="submit" disabled={verifying}>{verifying ? 'Verifying…' : 'Verify email'}</button>
    </form>
    <p className="auth-page__switch">Didn’t get a code? <button className="auth-page__link-button" type="button" onClick={resend} disabled={resending}>{resending ? 'Sending…' : 'Resend code'}</button></p>
    <p className="auth-page__switch"><Link to="/login">Back to login</Link></p>
  </div></main><BackToTop /><Footer /></div>
}

export default VerifyEmail
