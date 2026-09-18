function idOf(department) {
  return department.id || department._id
}

function DepartmentList({ departments, loading, error, onRetry, selectedId, onSelect, canDelete, onDelete, deletingId }) {
  if (loading) return <div className="department-management__feedback" role="status">Loading departments…</div>
  if (error) return <div className="department-management__feedback department-management__feedback--error" role="alert"><p>{error}</p><button type="button" className="btn btn--outline" onClick={onRetry}>Try again</button></div>
  if (!departments.length) return <div className="department-management__feedback">No departments have been added yet.</div>

  return <div className="department-management__list">
    {departments.map((department) => <article key={idOf(department)} className={`department-management__item ${selectedId === idOf(department) ? 'department-management__item--active' : ''}`}>
      <button type="button" className="department-management__select" onClick={() => onSelect(department)}><strong>{department.name}</strong><span>{department.description || 'No description added'}</span><small>{department.isActive === false ? 'Inactive' : 'Active'} · /{department.slug}</small></button>
      {canDelete && <button type="button" className="department-management__delete" disabled={deletingId === idOf(department)} onClick={() => onDelete(department)}>{deletingId === idOf(department) ? 'Removing…' : 'Delete'}</button>}
    </article>)}
  </div>
}

export default DepartmentList
