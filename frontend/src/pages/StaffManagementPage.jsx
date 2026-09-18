import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import { createStaff, getStaff, updateStaff } from '../api'
import { getSession } from '../authStorage'
import './DashboardPage.css'

const emptyForm = { name: '', email: '', phone: '', password: '', role: 'doctor' }

function StaffManagementPage() {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState('')
  const currentUserId = getSession()?.user?.id

  useEffect(() => {
    getStaff()
      .then(setStaff)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const changeForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  async function addStaff(event) {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      const created = await createStaff(form)
      setStaff((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(emptyForm)
      setNotice(`${created.name} can now sign in as ${created.role}.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveStaff(member, changes) {
    setUpdatingId(member.id); setError(''); setNotice('')
    try {
      const updated = await updateStaff(member.id, changes)
      setStaff((current) => current.map((item) => item.id === updated.id ? updated : item))
      setNotice(`${updated.name}'s account was updated.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <main className="dashboard-page__main container">
        <div className="dashboard-page__head">
          <div><h1>Staff management</h1><p>Create clinic staff accounts, set their role, and control access.</p></div>
          <Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link>
        </div>
        {error && <p className="auth-page__error" role="alert">{error}</p>}
        {notice && <p className="dashboard-page__success" role="status">{notice}</p>}

        <section className="dashboard-page__appointments staff-management__section">
          <div className="dashboard-page__section-head"><h2>Add staff member</h2><p>Staff receive the password you set here. Ask them to change it after their first sign-in.</p></div>
          <form className="auth-page__form staff-management__form" onSubmit={addStaff}>
            <label>Full name<input required name="name" value={form.name} onChange={changeForm} /></label>
            <label>Email<input required type="email" name="email" value={form.email} onChange={changeForm} /></label>
            <label>Phone<input name="phone" value={form.phone} onChange={changeForm} /></label>
            <label>Temporary password<input required minLength="8" type="password" name="password" value={form.password} onChange={changeForm} /></label>
            <label>Role<select name="role" value={form.role} onChange={changeForm}><option value="doctor">Doctor</option><option value="editor">Editor</option></select></label>
            <button className="btn btn--primary" disabled={saving}>{saving ? 'Creating…' : 'Create staff account'}</button>
          </form>
        </section>

        <section className="dashboard-page__appointments">
          <div className="dashboard-page__section-head"><h2>Current staff</h2><p>Deactivated staff cannot sign in or use protected clinic features.</p></div>
          {loading ? <p className="dashboard-page__note">Loading staff…</p> : staff.length === 0 ? <p className="dashboard-page__note">No staff accounts yet.</p> : (
            <div className="dashboard-page__appointment-list">
              {staff.map((member) => <article className="dashboard-page__appointment staff-management__member" key={member.id}>
                <div><strong>{member.name}</strong><p>{member.email}{member.phone ? ` · ${member.phone}` : ''}</p><p><span className="dashboard-page__status">{member.role}</span> {!member.isActive && <span className="dashboard-page__status dashboard-page__status--cancelled">Deactivated</span>}</p></div>
                <div className="dashboard-page__appointment-actions">
                  {member.role !== 'admin' && <select aria-label={`Role for ${member.name}`} value={member.role} disabled={updatingId === member.id || member.id === currentUserId} onChange={(event) => saveStaff(member, { role: event.target.value })}><option value="doctor">Doctor</option><option value="editor">Editor</option></select>}
                  {member.id !== currentUserId && <button type="button" className="btn btn--outline" disabled={updatingId === member.id} onClick={() => saveStaff(member, { isActive: !member.isActive })}>{member.isActive ? 'Deactivate' : 'Reactivate'}</button>}
                </div>
              </article>)}
            </div>
          )}
        </section>
      </main>
      <BackToTop /><Footer />
    </div>
  )
}

export default StaffManagementPage
