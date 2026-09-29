import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { createMedicalRecord, createPatient, getMedicalRecords, getPatients, updatePatient } from '../api'
import { getSession } from '../authStorage'
import './DashboardPage.css'

const blankPatient = {
  fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '', bloodGroup: '', notes: '',
}

function idOf(patient) {
  return patient.id || patient._id
}

function toForm(patient = blankPatient) {
  return {
    ...blankPatient,
    ...patient,
    dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : '',
  }
}

function PatientManagementPage() {
  const role = getSession()?.user?.role
  const canRegisterPatients = ['admin', 'editor'].includes(role)
  const [patients, setPatients] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState(blankPatient)
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [records, setRecords] = useState([])
  const [recordForm, setRecordForm] = useState({ diagnosis: '', notes: '', prescriptions: '' })
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordSaving, setRecordSaving] = useState(false)
  const canCreateRecords = ['admin', 'editor', 'doctor'].includes(role)

  useEffect(() => {
    getPatients().then(setPatients).catch((err) => setError(err.message)).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) { setRecords([]); return }
    let active = true
    setRecordsLoading(true)
    getMedicalRecords({ patientId: selectedId })
      .then((items) => { if (active) setRecords(items) })
      .catch((err) => { if (active) setError(err.message || 'Unable to load patient records.') })
      .finally(() => { if (active) setRecordsLoading(false) })
    return () => { active = false }
  }, [selectedId])

  const visiblePatients = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return patients
    return patients.filter((patient) => [patient.fullName, patient.email, patient.phone].some((value) => String(value || '').toLowerCase().includes(normalized)))
  }, [patients, query])

  function selectPatient(patient) {
    setSelectedId(idOf(patient))
    setForm(toForm(patient))
    setError(''); setNotice('')
  }

  function startNew() {
    setSelectedId(''); setForm(blankPatient); setError(''); setNotice('')
  }

  function changeField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function savePatient(event) {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      const payload = { ...form }
      const saved = selectedId ? await updatePatient(selectedId, payload) : await createPatient(payload)
      setPatients((current) => selectedId
        ? current.map((patient) => idOf(patient) === idOf(saved) ? saved : patient)
        : [saved, ...current])
      setSelectedId(idOf(saved)); setForm(toForm(saved))
      setNotice(selectedId ? 'Patient profile updated.' : 'Patient profile created.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveRecord(event) {
    event.preventDefault()
    if (!selectedId) return
    setRecordSaving(true); setError(''); setNotice('')
    try {
      const saved = await createMedicalRecord({
        patientId: selectedId,
        diagnosis: recordForm.diagnosis,
        notes: recordForm.notes,
        prescriptions: recordForm.prescriptions.split('\n').map((item) => item.trim()).filter(Boolean),
      })
      setRecords((current) => [saved, ...current])
      setRecordForm({ diagnosis: '', notes: '', prescriptions: '' })
      setNotice('Clinical record saved.')
    } catch (err) {
      setError(err.message || 'Unable to save clinical record.')
    } finally {
      setRecordSaving(false)
    }
  }

  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Patient management</h1><p>{role === 'doctor' ? 'View and update the patients assigned to your care.' : 'Maintain patient contact and clinical profile information.'}</p></div><Link className="btn btn--outline" to={role === 'doctor' ? '/doctor' : '/dashboard'}>Back to dashboard</Link></div>
    {error && <p className="auth-page__error" role="alert">{error}</p>}
    {notice && <p className="dashboard-page__success" role="status">{notice}</p>}
    <div className="patient-management__layout">
      <section className="patient-management__directory">
        <div className="dashboard-page__section-head"><h2>Patient directory</h2><p>{loading ? 'Loading patients…' : `${visiblePatients.length} patient${visiblePatients.length === 1 ? '' : 's'} available`}</p></div>
        <input className="patient-management__search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone" aria-label="Search patients" />
        {canRegisterPatients && <button type="button" className="btn btn--outline patient-management__new" onClick={startNew}>Add patient</button>}
        <div className="patient-management__list">
          {visiblePatients.map((patient) => <button type="button" className={`patient-management__item ${selectedId === idOf(patient) ? 'patient-management__item--active' : ''}`} key={idOf(patient)} onClick={() => selectPatient(patient)}><strong>{patient.fullName}</strong><span>{patient.email}</span><small>{patient.phone}</small></button>)}
          {!loading && visiblePatients.length === 0 && <p className="dashboard-page__note">No patients found.</p>}
        </div>
      </section>
      <section className="patient-management__profile">
        <div className="dashboard-page__section-head"><h2>{selectedId ? 'Patient profile' : canRegisterPatients ? 'New patient' : 'Select a patient'}</h2><p>{selectedId ? 'Keep demographic and care information current.' : canRegisterPatients ? 'Create a profile for a new clinic patient.' : 'Choose a patient from the directory to view their profile.'}</p></div>
        {(selectedId || canRegisterPatients) && <form className="auth-page__form patient-management__form" onSubmit={savePatient}>
          <label>Full name<input required name="fullName" value={form.fullName} onChange={changeField} /></label>
          <label>Email<input required type="email" name="email" value={form.email} onChange={changeField} /></label>
          <label>Phone<input required name="phone" value={form.phone} onChange={changeField} /></label>
          <label>Date of birth<input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={changeField} /></label>
          <label>Gender<select name="gender" value={form.gender} onChange={changeField}><option value="">Not specified</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></label>
          <label>Blood group<input name="bloodGroup" value={form.bloodGroup} onChange={changeField} placeholder="e.g. O+" /></label>
          <label className="patient-management__wide">Address<input name="address" value={form.address} onChange={changeField} /></label>
          <label className="patient-management__wide">Clinical notes<textarea name="notes" value={form.notes} onChange={changeField} placeholder="Allergies, care preferences, or other relevant notes" /></label>
          <button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : selectedId ? 'Save changes' : 'Create patient'}</button>
        </form>}
      </section>
      {selectedId && <section className="patient-management__records">
        <div className="dashboard-page__section-head"><h2>Clinical records · {form.fullName}</h2><p>Visit notes and care plans for this patient.</p></div>
        {canCreateRecords && <form className="auth-page__form patient-management__record-form" onSubmit={saveRecord}>
          <label>Diagnosis<input required minLength="2" value={recordForm.diagnosis} onChange={(event) => setRecordForm((current) => ({ ...current, diagnosis: event.target.value }))} /></label>
          <label>Notes<textarea value={recordForm.notes} onChange={(event) => setRecordForm((current) => ({ ...current, notes: event.target.value }))} /></label>
          <label>Prescriptions (one per line)<textarea value={recordForm.prescriptions} onChange={(event) => setRecordForm((current) => ({ ...current, prescriptions: event.target.value }))} /></label>
          <button className="btn btn--primary" disabled={recordSaving}>{recordSaving ? 'Saving…' : 'Add clinical record'}</button>
        </form>}
        {recordsLoading ? <p className="dashboard-page__note">Loading clinical records…</p> : records.length ? <div className="patient-management__record-list">{records.map((record) => <article className="patient-management__record" key={record._id || record.id}><div><strong>{record.diagnosis}</strong><small>{new Date(record.createdAt).toLocaleDateString()}{record.doctorId?.name ? ` · ${record.doctorId.name}` : ''}</small></div>{record.notes && <p>{record.notes}</p>}{record.prescriptions?.length > 0 && <p><strong>Prescriptions:</strong> {record.prescriptions.join(', ')}</p>}</article>)}</div> : <p className="dashboard-page__note">No clinical records for this patient yet.</p>}
      </section>}
    </div>
  </main><BackToTop /><Footer /></div>
}

export default PatientManagementPage
