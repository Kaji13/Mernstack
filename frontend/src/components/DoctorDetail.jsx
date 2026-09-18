import { useCallback, useEffect, useState } from 'react'
import { getDoctorData } from '../api'

function DoctorDetail({ doctorId, fallbackDoctor, onClose, onBook, onWaitlist }) {
  const [doctor, setDoctor] = useState(fallbackDoctor)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDoctor = useCallback(async () => {
    setLoading(true); setError('')
    try {
      setDoctor(await getDoctorData(doctorId))
    } catch (err) {
      setError(err.message || 'Unable to load this doctor profile.')
      setDoctor(fallbackDoctor)
    } finally {
      setLoading(false)
    }
  }, [doctorId, fallbackDoctor])

  useEffect(() => { loadDoctor() }, [loadDoctor])

  return <div className="doctors-page__modal-overlay" onClick={onClose} role="presentation"><div className="doctors-page__modal" role="dialog" aria-modal="true" aria-labelledby="doctor-profile-title" onClick={(event) => event.stopPropagation()} style={{ '--doctor-accent': doctor?.accent || '#0a4d8c' }}>
    <button type="button" className="doctors-page__modal-close" onClick={onClose} aria-label="Close profile">×</button>
    {loading ? <div className="doctors-page__feedback" role="status"><span className="doctors-page__spinner" aria-hidden="true" /><p>Loading doctor profile…</p></div> : !doctor ? <div className="doctors-page__feedback doctors-page__feedback--error" role="alert"><h3>Profile unavailable</h3><p>{error || 'This doctor could not be found.'}</p><button type="button" className="btn btn--outline" onClick={loadDoctor}>Try again</button></div> : <>
      {error && <div className="doctors-page__inline-error" role="alert"><span>{error}</span><button type="button" onClick={loadDoctor}>Retry</button></div>}
      <div className="doctors-page__modal-header"><div className="doctors-page__avatar doctors-page__avatar--lg" aria-hidden="true">{doctor.initials}</div><div><h2 id="doctor-profile-title">{doctor.name}</h2><p className="doctors-page__specialty">{doctor.specialtyLabel}</p><p className="doctors-page__title">{doctor.title}</p><span className={`doctors-page__status ${doctor.available ? 'doctors-page__status--online' : ''}`}>{doctor.available ? 'Available' : 'Next week'}</span></div></div>
      <p className="doctors-page__modal-bio">{doctor.bio}</p>
      <dl className="doctors-page__facts"><div><dt>Education</dt><dd>{doctor.education}</dd></div><div><dt>Experience</dt><dd>{doctor.experience}</dd></div><div><dt>Clinic days</dt><dd>{doctor.clinicDays}</dd></div><div><dt>Visit length</dt><dd>{doctor.consultation}</dd></div><div><dt>Languages</dt><dd>{(doctor.languages || []).join(', ')}</dd></div><div><dt>Patients treated</dt><dd>{doctor.patients}</dd></div><div><dt>Rating</dt><dd>★ {doctor.rating} ({doctor.reviewCount} reviews)</dd></div></dl>
      <h3>Focus areas</h3><ul className="doctors-page__features">{(doctor.focusAreas || []).map((area) => <li key={area}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>{area}</li>)}</ul>
      <div className="doctors-page__modal-actions"><button type="button" className="btn btn--primary" onClick={() => onBook(doctor)}>Reserve a slot</button><button type="button" className="btn btn--outline" onClick={() => onWaitlist(doctor)}>Join waitlist</button></div>
    </>}
  </div></div>
}

export default DoctorDetail
