import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function FeaturedDoctors() {
  const { data } = useHomeData()
  const doctors = data.doctors

  return (
    <section id="doctors" className="section doctors">
      <div className="container">
        <ScrollReveal className="section__header">
          <span className="section__label">Our Team</span>
          <h2>Featured Doctors</h2>
          <p>
            Meet our board-certified specialists dedicated to providing exceptional
            patient care.
          </p>
        </ScrollReveal>
        <div className="doctors__grid">
          {doctors.map((doctor, index) => (
            <ScrollReveal key={doctor.name} delay={index * 90}>
              <article className="doctor-card">
                <div className="doctor-card__top">
                  <div className="doctor-card__avatar">{doctor.initials}</div>
                  <span className={`doctor-card__status ${doctor.available ? 'doctor-card__status--online' : ''}`}>
                    {doctor.available ? 'Available' : 'Fully Booked'}
                  </span>
                </div>
                <h3>{doctor.name}</h3>
                <p className="doctor-card__specialty">{doctor.specialty}</p>
                <div className="doctor-card__meta">
                  <span className="doctor-card__rating">★ {doctor.rating}</span>
                  <span className="doctor-card__experience">{doctor.experience}</span>
                </div>
                <a href="#appointment" className="btn btn--outline btn--sm btn--full">
                  Book Appointment
                </a>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedDoctors
