const doctors = [
  {
    name: 'Dr. Sarah Mitchell',
    specialty: 'Cardiologist',
    experience: '12 years experience',
    initials: 'SM',
  },
  {
    name: 'Dr. James Chen',
    specialty: 'Orthopedic Surgeon',
    experience: '15 years experience',
    initials: 'JC',
  },
  {
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    experience: '10 years experience',
    initials: 'ER',
  },
  {
    name: 'Dr. Michael Okonkwo',
    specialty: 'General Physician',
    experience: '18 years experience',
    initials: 'MO',
  },
]

function FeaturedDoctors() {
  return (
    <section id="doctors" className="section doctors">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Our Team</span>
          <h2>Featured Doctors</h2>
          <p>
            Meet our board-certified specialists dedicated to providing exceptional
            patient care.
          </p>
        </div>
        <div className="doctors__grid">
          {doctors.map((doctor) => (
            <article key={doctor.name} className="doctor-card">
              <div className="doctor-card__avatar">{doctor.initials}</div>
              <h3>{doctor.name}</h3>
              <p className="doctor-card__specialty">{doctor.specialty}</p>
              <p className="doctor-card__experience">{doctor.experience}</p>
              <a href="#appointment" className="btn btn--outline btn--sm">
                Book with {doctor.name.split(' ')[1]}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedDoctors
