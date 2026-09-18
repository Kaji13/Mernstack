import ScrollReveal from '../hooks/ScrollReveal'

function DoctorsList({ doctors, loading, error, onRetry, onViewProfile, onBook }) {
  if (loading) {
    return <div className="doctors-page__feedback" role="status"><span className="doctors-page__spinner" aria-hidden="true" /><p>Loading our specialists…</p></div>
  }

  if (error) {
    return <div className="doctors-page__feedback doctors-page__feedback--error" role="alert"><h3>We could not refresh the doctor directory</h3><p>{error}</p><button type="button" className="btn btn--outline" onClick={onRetry}>Try again</button></div>
  }

  if (!doctors.length) {
    return <div className="doctors-page__empty"><span aria-hidden="true">🩺</span><h3>No doctors found</h3><p>Try a different name, specialty, or availability filter.</p></div>
  }

  return <div className="doctors-page__grid">
    {doctors.map((doctor, index) => {
      const doctorId = doctor.slug || doctor.id
      return <ScrollReveal key={doctorId} delay={index * 50}><article className="doctors-page__card" style={{ '--doctor-accent': doctor.accent }}>
        {doctor.featured && <span className="doctors-page__badge">Featured</span>}
        <div className="doctors-page__card-top"><div className="doctors-page__avatar" aria-hidden="true">{doctor.initials}</div><span className={`doctors-page__status ${doctor.available ? 'doctors-page__status--online' : ''}`}>{doctor.available ? 'Available' : 'Next week'}</span></div>
        <h3>{doctor.name}</h3><p className="doctors-page__specialty">{doctor.specialtyLabel}</p><p className="doctors-page__title">{doctor.title}</p>
        <div className="doctors-page__meta"><span>★ {doctor.rating}</span><span>{doctor.experience}</span></div>
        <p className="doctors-page__bio">{doctor.bio}</p>
        <ul className="doctors-page__tags">{(doctor.focusAreas || []).slice(0, 3).map((area) => <li key={area}>{area}</li>)}</ul>
        <div className="doctors-page__card-actions"><button type="button" className="btn btn--outline btn--sm btn--full" onClick={() => onViewProfile(doctorId)}>View profile</button><button type="button" className="btn btn--primary btn--sm btn--full" onClick={() => onBook(doctor)}>{doctor.available ? 'Reserve a slot' : 'Next openings'}</button></div>
      </article></ScrollReveal>
    })}
  </div>
}

export default DoctorsList
