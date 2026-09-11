import { useEffect, useState } from 'react'
import { createAppointment, getDoctorSchedule } from '../api'
import { getSession } from '../authStorage'

const defaultVisitTypes = [
  { id: 'new-patient', label: 'New patient visit' },
  { id: 'follow-up', label: 'Follow-up' },
  { id: 'second-opinion', label: 'Second opinion' },
]

function DoctorVisitScheduler({ doctor, onClose, onJoinWaitlist }) {
  const session = getSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [schedule, setSchedule] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [visitType, setVisitType] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(null)
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: session?.user?.phone || '',
    message: '',
  })

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getDoctorSchedule(doctor.slug || doctor.id)
      .then((payload) => {
        if (!active) return
        setSchedule(payload.schedule)
        const firstOpen = payload.schedule.days.find((day) => day.openCount > 0)
        setSelectedDate(firstOpen?.date ?? '')
        setVisitType(payload.doctor.visitTypes?.[0]?.id ?? defaultVisitTypes[0].id)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [doctor])

  const selectedDay = schedule?.days.find((day) => day.date === selectedDate)
  const visitTypes = doctor.visitTypes?.length ? doctor.visitTypes : defaultVisitTypes

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedDate || !selectedSlot || !visitType) {
      setError('Choose a date, time, and visit type to continue.')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const appointment = await createAppointment({
        ...form,
        date: selectedDate,
        doctorSlug: doctor.slug || doctor.id,
        timeSlot: selectedSlot,
        visitType,
      })
      if (appointment.payment?.paymentUrl) {
        window.location.assign(appointment.payment.paymentUrl)
        return
      }
      setConfirmed({
        date: selectedDate,
        time: selectedDay?.slots.find((slot) => slot.time === selectedSlot)?.label ?? selectedSlot,
        visitType: visitTypes.find((type) => type.id === visitType)?.label ?? visitType,
        reference: appointment._id?.slice(-8)?.toUpperCase() ?? 'REQUESTED',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="doctors-page__modal-overlay" onClick={onClose} role="presentation">
      <div
        className="doctors-page__modal doctors-page__scheduler"
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-schedule-title"
        onClick={(event) => event.stopPropagation()}
        style={{ '--doctor-accent': doctor.accent }}
      >
        <button type="button" className="doctors-page__modal-close" onClick={onClose} aria-label="Close scheduler">
          ×
        </button>

        {confirmed ? (
          <div className="doctors-page__confirm">
            <span className="doctors-page__confirm-icon" aria-hidden="true">✓</span>
            <h2 id="doctor-schedule-title">Appointment request sent</h2>
            <p>
              Your request for <strong>{confirmed.date}</strong> at <strong>{confirmed.time}</strong>{' '}
              with {doctor.name} has been received. The clinic will confirm your {confirmed.visitType.toLowerCase()}.
            </p>
            <p className="doctors-page__confirm-ref">Request {confirmed.reference}</p>
            <button type="button" className="btn btn--primary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <header className="doctors-page__scheduler-head">
              <div className="doctors-page__avatar" aria-hidden="true">
                {doctor.initials}
              </div>
              <div>
                <p className="doctors-page__scheduler-kicker">Reserve a live slot</p>
                <h2 id="doctor-schedule-title">{doctor.name}</h2>
                <p>
                  {doctor.specialtyLabel} · {doctor.consultation} · {doctor.clinicDays}
                </p>
              </div>
            </header>

            {!doctor.available && (
              <div className="doctors-page__notice">
                This week is full. You can still lock a slot next week, or join the waitlist if an earlier opening appears.
              </div>
            )}

            {loading && <p className="doctors-page__scheduler-status">Loading this doctor's calendar...</p>}
            {error && <p className="doctors-page__scheduler-error" role="alert">{error}</p>}

            {!loading && schedule && (
              <form className="doctors-page__scheduler-form" onSubmit={handleSubmit}>
                <fieldset>
                  <legend>Visit type</legend>
                  <div className="doctors-page__pills">
                    {visitTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        className={`doctors-page__pill ${visitType === type.id ? 'doctors-page__pill--active' : ''}`}
                        onClick={() => setVisitType(type.id)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend>Clinic day</legend>
                  {schedule.days.length === 0 ? (
                    <p>No clinic days are currently open. Join the waitlist instead.</p>
                  ) : (
                    <div className="doctors-page__dates">
                      {schedule.days.map((day) => (
                        <button
                          key={day.date}
                          type="button"
                          disabled={day.openCount === 0}
                          className={`doctors-page__date ${selectedDate === day.date ? 'doctors-page__date--active' : ''}`}
                          onClick={() => {
                            setSelectedDate(day.date)
                            setSelectedSlot('')
                          }}
                        >
                          <span>{day.month}</span>
                          <strong>{day.label.split(' ')[1]}</strong>
                          <em>{day.weekday.slice(0, 3)}</em>
                          <small>{day.openCount} open</small>
                        </button>
                      ))}
                    </div>
                  )}
                </fieldset>

                {selectedDay && (
                  <fieldset>
                    <legend>Time</legend>
                    <div className="doctors-page__slots">
                      {selectedDay.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          className={`doctors-page__slot ${selectedSlot === slot.time ? 'doctors-page__slot--active' : ''}`}
                          onClick={() => setSelectedSlot(slot.time)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}

                <div className="form-row">
                  <label>
                    Full name
                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Jane Doe" />
                  </label>
                  <label>
                    Phone
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" />
                  </label>
                </div>
                <label>
                  Email
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="jane@email.com" />
                </label>
                <label>
                  Reason for visit (optional)
                  <textarea name="message" rows="3" value={form.message} onChange={handleChange} placeholder="Symptoms, follow-up notes, or questions…" />
                </label>

                <div className="doctors-page__scheduler-actions">
                  <button type="submit" className="btn btn--primary" disabled={submitting || !selectedSlot}>
                    {submitting ? 'Reserving slot…' : 'Confirm this visit'}
                  </button>
                  {onJoinWaitlist && (
                    <button type="button" className="btn btn--outline" onClick={onJoinWaitlist}>
                      Join waitlist instead
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DoctorVisitScheduler
