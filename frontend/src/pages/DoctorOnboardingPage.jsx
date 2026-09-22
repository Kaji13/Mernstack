import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { createDoctorProfile, getMyDoctorProfile } from '../api'
import { getSession } from '../authStorage'
import './DashboardPage.css'

const days = [
  ['0', 'Sunday'], ['1', 'Monday'], ['2', 'Tuesday'], ['3', 'Wednesday'],
  ['4', 'Thursday'], ['5', 'Friday'], ['6', 'Saturday'],
]

const initialForm = {
  specialty: '', title: '', experience: '', education: '', languages: '', focusAreas: '',
  clinicDays: 'Sunday–Friday', slotTimes: '09:00, 10:00, 11:00, 14:00, 15:00',
  consultationFee: '', bio: '', workDays: ['0', '1', '2', '3', '4'],
}

function listFrom(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function DoctorOnboardingPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    getMyDoctorProfile()
      .then(({ doctor }) => { if (doctor) navigate('/doctor', { replace: true }) })
      .catch((err) => setRequestError(err.message || 'Unable to check your profile.'))
      .finally(() => setChecking(false))
  }, [navigate])

  function change(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function toggleDay(event) {
    const value = event.target.value
    setForm((current) => ({
      ...current,
      workDays: event.target.checked ? [...current.workDays, value] : current.workDays.filter((day) => day !== value),
    }))
    setErrors((current) => ({ ...current, workDays: '' }))
  }

  function validateForm() {
    const next = {}
    if (form.specialty.trim().length < 2) next.specialty = 'Enter your specialty.'
    if (form.title.trim().length < 2) next.title = 'Enter your professional title.'
    if (!/^\d+(\s*\+?\s*years?)?$/i.test(form.experience.trim())) next.experience = 'Use years of experience, for example “8 years”.'
    if (form.education.trim().length < 2) next.education = 'Enter your education or credentials.'
    if (!listFrom(form.languages).length) next.languages = 'Add at least one language.'
    if (!listFrom(form.focusAreas).length) next.focusAreas = 'Add at least one focus area.'
    if (!form.workDays.length) next.workDays = 'Select at least one clinic day.'
    const times = listFrom(form.slotTimes)
    if (!times.length || times.some((time) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))) next.slotTimes = 'Use comma-separated 24-hour times, for example 09:00, 14:30.'
    if (form.consultationFee !== '' && (!Number.isFinite(Number(form.consultationFee)) || Number(form.consultationFee) < 0)) next.consultationFee = 'Enter a valid non-negative fee.'
    if (form.bio.trim().length < 20) next.bio = 'Tell patients about your approach in at least 20 characters.'
    return next
  }

  async function submit(event) {
    event.preventDefault()
    const nextErrors = validateForm()
    setErrors(nextErrors)
    setRequestError('')
    if (Object.keys(nextErrors).length) return

    const specialtyLabel = form.specialty.trim()
    const specialtyId = specialtyLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setSaving(true)
    try {
      await createDoctorProfile({
        name: session?.user?.name || 'Doctor',
        specialtyId,
        specialtyLabel,
        title: form.title.trim(),
        experience: form.experience.trim(),
        education: form.education.trim(),
        languages: listFrom(form.languages),
        focusAreas: listFrom(form.focusAreas),
        clinicDays: form.clinicDays.trim() || 'By appointment',
        slotTimes: listFrom(form.slotTimes),
        workDays: form.workDays.map(Number),
        consultationFee: Number(form.consultationFee || 0),
        consultation: Number(form.consultationFee || 0) ? `Rs ${Number(form.consultationFee).toLocaleString()} consultation` : 'By appointment',
        bio: form.bio.trim(),
        patients: '0', rating: 5, available: true,
      })
      navigate('/doctor', { replace: true })
    } catch (err) {
      setRequestError(err.message || 'We could not save your profile.')
    } finally {
      setSaving(false)
    }
  }

  if (checking) return null

  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Set up your doctor profile</h1><p>Complete these details once so patients can find you and book an appropriate time.</p></div></div>
    <section className="dashboard-page__appointments">
      <form className="auth-page__form doctor-onboarding__form" noValidate onSubmit={submit}>
        <label>Specialty<input name="specialty" value={form.specialty} onChange={change} aria-invalid={Boolean(errors.specialty)} placeholder="Cardiology" />{errors.specialty && <small className="auth-page__error">{errors.specialty}</small>}</label>
        <label>Professional title<input name="title" value={form.title} onChange={change} aria-invalid={Boolean(errors.title)} placeholder="Consultant Cardiologist" />{errors.title && <small className="auth-page__error">{errors.title}</small>}</label>
        <label>Experience<input name="experience" value={form.experience} onChange={change} aria-invalid={Boolean(errors.experience)} placeholder="8 years" />{errors.experience && <small className="auth-page__error">{errors.experience}</small>}</label>
        <label>Education / credentials<input name="education" value={form.education} onChange={change} aria-invalid={Boolean(errors.education)} placeholder="MBBS, MD Cardiology" />{errors.education && <small className="auth-page__error">{errors.education}</small>}</label>
        <label>Languages<input name="languages" value={form.languages} onChange={change} aria-invalid={Boolean(errors.languages)} placeholder="English, Nepali" />{errors.languages && <small className="auth-page__error">{errors.languages}</small>}</label>
        <label>Focus areas<input name="focusAreas" value={form.focusAreas} onChange={change} aria-invalid={Boolean(errors.focusAreas)} placeholder="Heart failure, preventive care" />{errors.focusAreas && <small className="auth-page__error">{errors.focusAreas}</small>}</label>
        <label>Clinic-days summary<input name="clinicDays" value={form.clinicDays} onChange={change} placeholder="Sunday–Friday" /></label>
        <label>Consultation fee (Rs)<input name="consultationFee" type="number" min="0" value={form.consultationFee} onChange={change} aria-invalid={Boolean(errors.consultationFee)} placeholder="1500" />{errors.consultationFee && <small className="auth-page__error">{errors.consultationFee}</small>}</label>
        <fieldset className="doctor-onboarding__fieldset" aria-describedby={errors.workDays ? 'work-day-error' : undefined}><legend>Available clinic days</legend>{days.map(([value, label]) => <label className="doctor-onboarding__checkbox" key={value}><input type="checkbox" value={value} checked={form.workDays.includes(value)} onChange={toggleDay} />{label}</label>)}{errors.workDays && <small id="work-day-error" className="auth-page__error">{errors.workDays}</small>}</fieldset>
        <label className="doctor-onboarding__wide">Appointment times<input name="slotTimes" value={form.slotTimes} onChange={change} aria-invalid={Boolean(errors.slotTimes)} placeholder="09:00, 10:00, 14:30" />{errors.slotTimes && <small className="auth-page__error">{errors.slotTimes}</small>}</label>
        <label className="doctor-onboarding__wide">Professional bio<textarea name="bio" value={form.bio} onChange={change} aria-invalid={Boolean(errors.bio)} placeholder="Share your clinical approach and the care patients can expect." />{errors.bio && <small className="auth-page__error">{errors.bio}</small>}</label>
        {requestError && <p className="auth-page__error doctor-onboarding__wide" role="alert">{requestError}</p>}
        <div className="department-management__actions"><button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving profile…' : 'Complete profile'}</button></div>
      </form>
    </section>
  </main><BackToTop /><Footer /></div>
}

export default DoctorOnboardingPage
