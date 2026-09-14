import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { createMedicalRecord, getAppointments, getMedicalRecords, getPatients, updateAppointmentStatus } from '../api'
import { clearSession, getSession } from '../authStorage'
import './DashboardPage.css'

function DoctorPortalPage() {
  const navigate = useNavigate()
  const session = getSession()
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [recordForm, setRecordForm] = useState({ patientId: '', diagnosis: '', notes: '', prescriptions: '' })

  useEffect(() => {
    if (!session?.token) return navigate('/login')
    if (session.user?.role !== 'doctor') return navigate('/dashboard')
    Promise.all([getAppointments(), getPatients(), getMedicalRecords()])
      .then(([nextAppointments, nextPatients, nextRecords]) => {
        setAppointments(nextAppointments)
        setPatients(nextPatients)
        setRecords(nextRecords)
      })
      .catch((err) => setError(err.message))
  }, [navigate, session?.token, session?.user?.role])

  const today = new Date().toDateString()
  const todayAppointments = useMemo(() => appointments.filter((item) => new Date(item.date).toDateString() === today), [appointments, today])

  async function changeStatus(id, status) {
    try {
      const updated = await updateAppointmentStatus(id, status)
      setAppointments((current) => current.map((item) => item._id === id ? updated : item))
    } catch (err) { setError(err.message) }
  }

  async function saveRecord(event) {
    event.preventDefault()
    setSaving(true); setError('')
    try {
      const created = await createMedicalRecord({ ...recordForm, prescriptions: recordForm.prescriptions.split('\n').map((item) => item.trim()).filter(Boolean) })
      setRecords((current) => [created, ...current])
      setRecordForm({ patientId: '', diagnosis: '', notes: '', prescriptions: '' })
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  if (!session?.token || session.user?.role !== 'doctor') return null
  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Doctor portal</h1><p>Welcome, Dr. {session.user?.name}. Manage your day, patients, and clinical notes.</p></div><div className="dashboard-page__actions"><Link className="btn btn--outline" to="/chat">Messages</Link><button className="btn btn--primary" onClick={() => { clearSession(); navigate('/login') }}>Log out</button></div></div>
    {error && <p className="auth-page__error">{error}</p>}
    <section className="dashboard-page__grid"><article className="dashboard-page__card"><p>Today’s visits</p><strong>{todayAppointments.length}</strong></article><article className="dashboard-page__card"><p>Assigned appointments</p><strong>{appointments.length}</strong></article><article className="dashboard-page__card"><p>Patients</p><strong>{patients.length}</strong></article><article className="dashboard-page__card"><p>Clinical records</p><strong>{records.length}</strong></article></section>
    <section className="dashboard-page__appointments"><div className="dashboard-page__section-head"><h2>Appointments</h2><p>Only appointments assigned to you are shown here.</p></div>{appointments.length ? <div className="dashboard-page__appointment-list">{appointments.map((item) => <article className="dashboard-page__appointment" key={item._id}><div><strong>{item.name}</strong><p>{new Date(item.date).toLocaleDateString()} · {item.timeSlot || 'Time to confirm'} · {item.visitType || item.department}</p><p>{item.phone} · {item.email}</p></div><div className="dashboard-page__appointment-actions"><span className={`dashboard-page__status dashboard-page__status--${item.status}`}>{item.status}</span>{item.status === 'pending' && <button className="btn btn--primary" onClick={() => changeStatus(item._id, 'confirmed')}>Confirm</button>}{item.status === 'confirmed' && <button className="btn btn--outline" onClick={() => changeStatus(item._id, 'completed')}>Complete</button>}</div></article>)}</div> : <p className="dashboard-page__note">No appointments assigned yet.</p>}</section>
    <section className="dashboard-page__appointments"><div className="dashboard-page__section-head"><h2>Patient records</h2><p>Create a clinical note for one of your patients.</p></div><form className="auth-page__form" onSubmit={saveRecord}><label>Patient<select required value={recordForm.patientId} onChange={(e) => setRecordForm({ ...recordForm, patientId: e.target.value })}><option value="">Select patient</option>{patients.map((patient) => <option key={patient.id || patient._id} value={patient.id || patient._id}>{patient.fullName}</option>)}</select></label><label>Diagnosis<input required value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} /></label><label>Notes<textarea value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} /></label><label>Prescriptions (one per line)<textarea value={recordForm.prescriptions} onChange={(e) => setRecordForm({ ...recordForm, prescriptions: e.target.value })} /></label><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save clinical record'}</button></form></section>
    <section className="dashboard-page__appointments"><div className="dashboard-page__section-head"><h2>Recent clinical records</h2></div>{records.length ? <div className="dashboard-page__appointment-list">{records.slice(0, 5).map((record) => <article className="dashboard-page__appointment" key={record._id}><div><strong>{record.patientId?.fullName || 'Patient'}</strong><p>{record.diagnosis}</p><p>{record.notes || 'No additional notes'}</p></div></article>)}</div> : <p className="dashboard-page__note">No records created yet.</p>}</section>
  </main><Footer /></div>
}

export default DoctorPortalPage
