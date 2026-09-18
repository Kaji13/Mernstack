import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import DepartmentForm from '../components/DepartmentForm'
import DepartmentList from '../components/DepartmentList'
import { useDepartments } from '../context/DepartmentContext'
import { getSession } from '../authStorage'
import './DashboardPage.css'

function idOf(department) {
  return department.id || department._id
}

function DepartmentManagementPage() {
  const { departments, loading, error: loadError, refreshDepartments, addDepartment, saveDepartment, removeDepartment } = useDepartments()
  const role = getSession()?.user?.role
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(form) {
    setSaving(true); setError(''); setMessage('')
    try {
      const saved = selected ? await saveDepartment(idOf(selected), form) : await addDepartment(form)
      setSelected(saved)
      setMessage(selected ? 'Department updated.' : 'Department created.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteSelected(department) {
    if (!window.confirm(`Delete ${department.name}? This cannot be undone.`)) return
    const id = idOf(department)
    setDeletingId(id); setError(''); setMessage('')
    try {
      await removeDepartment(id)
      if (idOf(selected || {}) === id) setSelected(null)
      setMessage('Department deleted.')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId('')
    }
  }

  return <div className="dashboard-page"><Navbar /><main className="dashboard-page__main container">
    <div className="dashboard-page__head"><div><h1>Department management</h1><p>Organize clinic services and control which departments are available for appointments.</p></div><Link className="btn btn--outline" to="/dashboard">Back to dashboard</Link></div>
    {(error || loadError) && <p className="auth-page__error" role="alert">{error || loadError}</p>}
    {message && <p className="dashboard-page__success" role="status">{message}</p>}
    <div className="department-management__layout">
      <section className="department-management__panel"><div className="dashboard-page__section-head"><h2>Departments</h2><p>Choose a department to edit it.</p></div><DepartmentList departments={departments} loading={loading} error={loadError} onRetry={refreshDepartments} selectedId={idOf(selected || {})} onSelect={(department) => { setSelected(department); setError(''); setMessage('') }} canDelete={role === 'admin'} onDelete={deleteSelected} deletingId={deletingId} /></section>
      <section className="department-management__panel"><div className="dashboard-page__section-head"><h2>{selected ? 'Edit department' : 'New department'}</h2><p>{selected ? `Update ${selected.name}'s clinic information.` : 'Add a new clinic department.'}</p></div><DepartmentForm department={selected} saving={saving} onSubmit={submit} onCancel={() => { setSelected(null); setError(''); setMessage('') }} /></section>
    </div>
  </main><BackToTop /><Footer /></div>
}

export default DepartmentManagementPage
