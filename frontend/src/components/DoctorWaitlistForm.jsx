import { useState } from 'react'
import { joinDoctorWaitlist } from '../api'

function DoctorWaitlistForm({ doctor, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDays: '',
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const result = await joinDoctorWaitlist(doctor.slug || doctor.id, form)
      setSuccess(result.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="doctors-page__modal-overlay" onClick={onClose} role="presentation">
      <div
        className="doctors-page__modal doctors-page__waitlist"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-waitlist-title"
        onClick={(event) => event.stopPropagation()}
        style={{ '--doctor-accent': doctor.accent }}
      >
        <button type="button" className="doctors-page__modal-close" onClick={onClose} aria-label="Close waitlist">
          ×
        </button>
        {success ? (
          <div className="doctors-page__confirm">
            <span className="doctors-page__confirm-icon" aria-hidden="true">✓</span>
            <h2 id="doctor-waitlist-title">You're on the list</h2>
            <p>{success}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h2 id="doctor-waitlist-title">Join {doctor.name}'s waitlist</h2>
            <p className="doctors-page__waitlist-copy">
              If a cancelled visit opens earlier than the next published slot, the clinic will contact you first.
            </p>
            {error && <p className="doctors-page__scheduler-error" role="alert">{error}</p>}
            <form className="doctors-page__scheduler-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label>
                  Full name
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>
                <label>
                  Phone
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </label>
              </div>
              <label>
                Email
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </label>
              <label>
                Preferred days
                <input name="preferredDays" value={form.preferredDays} onChange={handleChange} placeholder=" mornings, Thu–Fri" />
              </label>
              <label>
                Note (optional)
                <textarea name="note" rows="3" value={form.note} onChange={handleChange} />
              </label>
              <div className="doctors-page__scheduler-actions">
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitting ? 'Adding you…' : 'Join waitlist'}
                </button>
                <button type="button" className="btn btn--outline" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default DoctorWaitlistForm
