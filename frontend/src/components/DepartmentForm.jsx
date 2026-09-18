import { useEffect, useState } from 'react'

const emptyDepartment = { name: '', slug: '', description: '', isActive: true }

function DepartmentForm({ department, saving, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyDepartment)

  useEffect(() => {
    setForm(department ? { ...emptyDepartment, ...department } : emptyDepartment)
  }, [department])

  function changeField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  return <form className="auth-page__form department-management__form" onSubmit={(event) => { event.preventDefault(); onSubmit(form) }}>
    <label>Department name<input required name="name" value={form.name} onChange={changeField} placeholder="e.g. Cardiology" /></label>
    <label>URL slug <input name="slug" value={form.slug} onChange={changeField} placeholder="Generated from the name if blank" /></label>
    <label className="department-management__wide">Description<textarea name="description" value={form.description} onChange={changeField} placeholder="What care does this department provide?" /></label>
    <label className="department-management__toggle"><input type="checkbox" name="isActive" checked={form.isActive} onChange={changeField} /> Available for appointments</label>
    <div className="department-management__actions"><button className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : department ? 'Save department' : 'Create department'}</button>{department && <button type="button" className="btn btn--outline" onClick={onCancel}>New department</button>}</div>
  </form>
}

export default DepartmentForm
