import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import ScrollReveal from '../hooks/ScrollReveal'
import {
  doctorSpecialties,
  doctorsCatalog,
  doctorHighlights,
  doctorVisitSteps,
} from '../data/doctorsPageData'
import './DoctorsPage.css'

function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeSpecialty, setActiveSpecialty] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const selectedDoctor = doctorsCatalog.find((doctor) => doctor.id === selectedId) ?? null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const paramId = searchParams.get('doctor')
    if (paramId && doctorsCatalog.some((doctor) => doctor.id === paramId)) {
      setSelectedId(paramId)
    }
  }, [searchParams])

  useEffect(() => {
    if (!selectedDoctor) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeProfile()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedDoctor])

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return doctorsCatalog.filter((doctor) => {
      const matchesSpecialty = activeSpecialty === 'all' || doctor.specialty === activeSpecialty
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' && doctor.available) ||
        (availability === 'booked' && !doctor.available)
      const matchesSearch =
        !query ||
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialtyLabel.toLowerCase().includes(query) ||
        doctor.title.toLowerCase().includes(query) ||
        doctor.focusAreas.some((area) => area.toLowerCase().includes(query)) ||
        doctor.languages.some((lang) => lang.toLowerCase().includes(query))
      return matchesSpecialty && matchesAvailability && matchesSearch
    })
  }, [activeSpecialty, availability, searchQuery])

  const availableCount = doctorsCatalog.filter((doctor) => doctor.available).length

  const openProfile = (id) => {
    setSelectedId(id)
    setSearchParams({ doctor: id }, { replace: true })
  }

  const closeProfile = () => {
    setSelectedId(null)
    setSearchParams({}, { replace: true })
  }

  return (
    <>
      <Navbar />
      <main className="doctors-page">
        <section className="doctors-page__hero">
          <div className="doctors-page__hero-bg" aria-hidden="true">
            <div className="doctors-page__hero-blob doctors-page__hero-blob--1" />
            <div className="doctors-page__hero-blob doctors-page__hero-blob--2" />
            <div className="doctors-page__hero-grid" />
          </div>
          <div className="container doctors-page__hero-inner">
            <ScrollReveal>
              <nav className="doctors-page__breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Doctors</span>
              </nav>
              <span className="section__label section__label--light">Our Specialists</span>
              <h1>Meet the Doctors Behind Your Care</h1>
              <p>
                Board-certified physicians across every major department — ready to listen,
                diagnose with care, and guide you through treatment.
              </p>
              <div className="doctors-page__hero-stats">
                <div>
                  <strong>{doctorsCatalog.length}</strong>
                  <span>Specialists</span>
                </div>
                <div>
                  <strong>{availableCount}</strong>
                  <span>Accepting patients</span>
                </div>
                <div>
                  <strong>4.8+</strong>
                  <span>Average rating</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="doctors-page__toolbar section">
          <div className="container">
            <ScrollReveal className="doctors-page__toolbar-inner">
              <div className="doctors-page__search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search by name, specialty, language, or focus area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search doctors"
                />
              </div>
              <div className="doctors-page__filters" role="tablist" aria-label="Filter by specialty">
                {doctorSpecialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSpecialty === specialty.id}
                    className={`doctors-page__filter ${activeSpecialty === specialty.id ? 'doctors-page__filter--active' : ''}`}
                    onClick={() => setActiveSpecialty(specialty.id)}
                  >
                    {specialty.label}
                  </button>
                ))}
              </div>
              <div className="doctors-page__availability" role="group" aria-label="Filter by availability">
                {[
                  { id: 'all', label: 'Any availability' },
                  { id: 'available', label: 'Available now' },
                  { id: 'booked', label: 'Fully booked' },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`doctors-page__avail ${availability === option.id ? 'doctors-page__avail--active' : ''}`}
                    onClick={() => setAvailability(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section doctors-page__catalog">
          <div className="container">
            {filteredDoctors.length === 0 ? (
              <div className="doctors-page__empty">
                <span aria-hidden="true">🩺</span>
                <h3>No doctors found</h3>
                <p>Try a different name, specialty, or availability filter.</p>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveSpecialty('all')
                    setAvailability('all')
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="doctors-page__grid">
                {filteredDoctors.map((doctor, index) => (
                  <ScrollReveal key={doctor.id} delay={index * 50}>
                    <article
                      className="doctors-page__card"
                      style={{ '--doctor-accent': doctor.accent }}
                    >
                      {doctor.featured && <span className="doctors-page__badge">Featured</span>}
                      <div className="doctors-page__card-top">
                        <div className="doctors-page__avatar" aria-hidden="true">
                          {doctor.initials}
                        </div>
                        <span
                          className={`doctors-page__status ${doctor.available ? 'doctors-page__status--online' : ''}`}
                        >
                          {doctor.available ? 'Available' : 'Fully booked'}
                        </span>
                      </div>
                      <h3>{doctor.name}</h3>
                      <p className="doctors-page__specialty">{doctor.specialtyLabel}</p>
                      <p className="doctors-page__title">{doctor.title}</p>
                      <div className="doctors-page__meta">
                        <span>★ {doctor.rating}</span>
                        <span>{doctor.experience}</span>
                      </div>
                      <p className="doctors-page__bio">{doctor.bio}</p>
                      <ul className="doctors-page__tags">
                        {doctor.focusAreas.slice(0, 3).map((area) => (
                          <li key={area}>{area}</li>
                        ))}
                      </ul>
                      <div className="doctors-page__card-actions">
                        <button
                          type="button"
                          className="btn btn--outline btn--sm btn--full"
                          onClick={() => openProfile(doctor.id)}
                        >
                          View profile
                        </button>
                        {doctor.available ? (
                          <Link to="/#appointment" className="btn btn--primary btn--sm btn--full">
                            Book visit
                          </Link>
                        ) : (
                          <button type="button" className="btn btn--sm btn--full doctors-page__booked" disabled>
                            Waitlist only
                          </button>
                        )}
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section doctors-page__highlights">
          <div className="container">
            <ScrollReveal className="section__header">
              <span className="section__label">Why Our Team</span>
              <h2>Specialists You Can Trust</h2>
            </ScrollReveal>
            <div className="doctors-page__highlights-grid">
              {doctorHighlights.map((item, index) => (
                <ScrollReveal key={item.title} delay={index * 80}>
                  <div className="doctors-page__highlight">
                    <span className="doctors-page__highlight-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section doctors-page__process">
          <div className="container">
            <ScrollReveal className="section__header">
              <span className="section__label">Getting Started</span>
              <h2>How to Choose Your Doctor</h2>
              <p>Find the right specialist and book in a few straightforward steps.</p>
            </ScrollReveal>
            <div className="doctors-page__process-grid">
              {doctorVisitSteps.map((step, index) => (
                <ScrollReveal key={step.step} delay={index * 100}>
                  <div className="doctors-page__process-step">
                    <span className="doctors-page__process-num">{step.step}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="doctors-page__cta">
          <div className="container">
            <ScrollReveal className="doctors-page__cta-inner">
              <div>
                <h2>Ready to meet a specialist?</h2>
                <p>
                  Book an appointment with an available doctor today. Walk-ins are welcome
                  for general consultations, but booking saves you time.
                </p>
              </div>
              <div className="doctors-page__cta-actions">
                <Link to="/#appointment" className="btn btn--primary btn--lg">
                  Book Appointment
                  <span aria-hidden="true">→</span>
                </Link>
                <Link to="/services" className="btn btn--outline">
                  Browse services
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />

      {selectedDoctor && (
        <div
          className="doctors-page__modal-overlay"
          onClick={closeProfile}
          role="presentation"
        >
          <div
            className="doctors-page__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-profile-title"
            onClick={(event) => event.stopPropagation()}
            style={{ '--doctor-accent': selectedDoctor.accent }}
          >
            <button type="button" className="doctors-page__modal-close" onClick={closeProfile} aria-label="Close profile">
              ×
            </button>
            <div className="doctors-page__modal-header">
              <div className="doctors-page__avatar doctors-page__avatar--lg" aria-hidden="true">
                {selectedDoctor.initials}
              </div>
              <div>
                <h2 id="doctor-profile-title">{selectedDoctor.name}</h2>
                <p className="doctors-page__specialty">{selectedDoctor.specialtyLabel}</p>
                <p className="doctors-page__title">{selectedDoctor.title}</p>
                <span
                  className={`doctors-page__status ${selectedDoctor.available ? 'doctors-page__status--online' : ''}`}
                >
                  {selectedDoctor.available ? 'Available' : 'Fully booked'}
                </span>
              </div>
            </div>
            <p className="doctors-page__modal-bio">{selectedDoctor.bio}</p>
            <dl className="doctors-page__facts">
              <div>
                <dt>Education</dt>
                <dd>{selectedDoctor.education}</dd>
              </div>
              <div>
                <dt>Experience</dt>
                <dd>{selectedDoctor.experience}</dd>
              </div>
              <div>
                <dt>Clinic days</dt>
                <dd>{selectedDoctor.clinicDays}</dd>
              </div>
              <div>
                <dt>Visit length</dt>
                <dd>{selectedDoctor.consultation}</dd>
              </div>
              <div>
                <dt>Languages</dt>
                <dd>{selectedDoctor.languages.join(', ')}</dd>
              </div>
              <div>
                <dt>Patients treated</dt>
                <dd>{selectedDoctor.patients}</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd>★ {selectedDoctor.rating} ({selectedDoctor.reviewCount} reviews)</dd>
              </div>
            </dl>
            <h3>Focus areas</h3>
            <ul className="doctors-page__features">
              {selectedDoctor.focusAreas.map((area) => (
                <li key={area}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {area}
                </li>
              ))}
            </ul>
            <div className="doctors-page__modal-actions">
              {selectedDoctor.available ? (
                <Link to="/#appointment" className="btn btn--primary" onClick={closeProfile}>
                  Book this visit
                </Link>
              ) : (
                <button type="button" className="btn doctors-page__booked" disabled>
                  Currently fully booked
                </button>
              )}
              <button type="button" className="btn btn--outline" onClick={closeProfile}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DoctorsPage
