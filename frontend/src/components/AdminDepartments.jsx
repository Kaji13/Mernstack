import { useState } from 'react'
import { getSession } from '../authStorage'
import { useDepartments } from '../context/DepartmentContext'
import DepartmentForm from './DepartmentForm'
import DepartmentList from './DepartmentList'

function idOf(department) {
  return department.id || department._id
}

/**
 * Department administration panel for clinic administrators and editors.
 * It keeps selection, save feedback, and deletion state close to the controls.
 */
function AdminDepartments() {
  const { departments, loading, error: loadError, refreshDepartments, addDepartment, saveDepartment, removeDepartment } = useDepartments()
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const canDelete = getSession()?.user?.role === 'admin'

  function resetSelection() {
    setSelected(null)
    setError('')
    setMessage('')
  }

  async function submit(form) {
    setSaving(true)
    setError('')
    setMessage('')
    try {
      const saved = selected ? await saveDepartment(idOf(selected), form) : await addDepartment(form)
      setSelected(saved)
      setMessage(selected ? 'Department updated.' : 'Department created.')
    } catch (err) {
      setError(err.message || 'We could not save the department.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteSelected(department) {
    if (!window.confirm(`Delete ${department.name}? This cannot be undone.`)) return
    const id = idOf(department)
    setDeletingId(id)
    setError('')
    setMessage('')
    try {
      await removeDepartment(id)
      if (idOf(selected || {}) === id) setSelected(null)
      setMessage('Department deleted.')
    } catch (err) {
      setError(err.message || 'We could not delete the department.')
    } finally {
      setDeletingId('')
    }
  }

  return <>
    {(error || loadError) && <p className="auth-page__error" role="alert">{error || loadError}</p>}
    {message && <p className="dashboard-page__success" role="status">{message}</p>}
    <div className="department-management__layout">
      <section className="department-management__panel">
        <div className="dashboard-page__section-head"><h2>Departments</h2><p>Choose a department to edit it.</p></div>
        <DepartmentList departments={departments} loading={loading} error={loadError} onRetry={refreshDepartments} selectedId={idOf(selected || {})} onSelect={(department) => { setSelected(department); setError(''); setMessage('') }} canDelete={canDelete} onDelete={deleteSelected} deletingId={deletingId} />
      </section>
      <section className="department-management__panel">
        <div className="dashboard-page__section-head"><h2>{selected ? 'Edit department' : 'New department'}</h2><p>{selected ? `Update ${selected.name}'s clinic information.` : 'Add a new clinic department.'}</p></div>
        <DepartmentForm department={selected} saving={saving} onSubmit={submit} onCancel={resetSelection} />
      </section>
    </div>
  </>
}

export default AdminDepartments
