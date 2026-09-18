import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import ScrollReveal from '../hooks/ScrollReveal'
import DoctorVisitScheduler from '../components/DoctorVisitScheduler'
import DoctorWaitlistForm from '../components/DoctorWaitlistForm'
import DoctorDetail from '../components/DoctorDetail'
import DoctorsList from '../components/DoctorsList'
import { useDoctors } from '../context/DoctorContext'
import './DoctorsPage.css'

function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { doctors, specialties, highlights, visitSteps, stats, loading, error, refreshDoctors } = useDoctors()
  const [activeSpecialty, setActiveSpecialty] = useState('all')
  const [availability, setAvailability] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const [waitlistDoctor, setWaitlistDoctor] = useState(null)

  const selectedDoctor = doctors.find((doctor) => (doctor.slug || doctor.id) === selectedId) ?? null

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const paramId = searchParams.get('doctor')
    if (paramId && doctors.some((doctor) => (doctor.slug || doctor.id) === paramId)) {
      setSelectedId(paramId)
    }
  }, [searchParams, doctors])

  useEffect(() => {
    if (!selectedDoctor && !bookingDoctor && !waitlistDoctor) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeProfile()
        setBookingDoctor(null)
        setWaitlistDoctor(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedDoctor, bookingDoctor, waitlistDoctor])

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return doctors.filter((doctor) => {
      const specialtyId = doctor.specialtyId || doctor.specialty
      const matchesSpecialty = activeSpecialty === 'all' || specialtyId === activeSpecialty
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
  }, [doctors, activeSpecialty, availability, searchQuery])

  const openProfile = (id) => {
    setSelectedId(id)
    setSearchParams({ doctor: id }, { replace: true })
  }

  const closeProfile = () => {
    setSelectedId(null)
    setSearchParams({}, { replace: true })
  }

  const openScheduler = (doctor) => {
    closeProfile()
    setWaitlistDoctor(null)
    setBookingDoctor(doctor)
  }

  const openWaitlist = (doctor) => {
    closeProfile()
    setBookingDoctor(null)
    setWaitlistDoctor(doctor)
  }

  const scrollToCatalog = () => {
    document.getElementById('doctor-catalog')?.scrollIntoView({ behavior: 'smooth' })
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
                  <strong>{stats?.total ?? doctors.length}</strong>
                  <span>Specialists</span>
                </div>
                <div>
                  <strong>{stats?.available ?? doctors.filter((doctor) => doctor.available).length}</strong>
                  <span>Accepting patients</span>
                </div>
                <div>
                  <strong>{stats?.averageRating ?? '4.8'}+</strong>
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
                {specialties.map((specialty) => (
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

        <section id="doctor-catalog" className="section doctors-page__catalog">
          <div className="container">
            {filteredDoctors.length === 0 && !loading && !error ? (
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
            ) : <DoctorsList doctors={filteredDoctors} loading={loading} error={error} onRetry={refreshDoctors} onViewProfile={openProfile} onBook={openScheduler} />}
          </div>
        </section>

        <section className="section doctors-page__highlights">
          <div className="container">
            <ScrollReveal className="section__header">
              <span className="section__label">Why Our Team</span>
              <h2>Specialists You Can Trust</h2>
            </ScrollReveal>
            <div className="doctors-page__highlights-grid">
              {highlights.map((item, index) => (
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
              <p>Find the right specialist and lock a real clinic slot in a few steps.</p>
            </ScrollReveal>
            <div className="doctors-page__process-grid">
              {visitSteps.map((step, index) => (
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
                  Pick a doctor above and reserve a live time slot. Fully booked physicians
                  still show next-week openings, or you can join their waitlist.
                </p>
              </div>
              <div className="doctors-page__cta-actions">
                <button type="button" className="btn btn--primary btn--lg" onClick={scrollToCatalog}>
                  Choose a doctor
                  <span aria-hidden="true">→</span>
                </button>
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

      {selectedDoctor && <DoctorDetail doctorId={selectedId} fallbackDoctor={selectedDoctor} onClose={closeProfile} onBook={openScheduler} onWaitlist={openWaitlist} />}

      {bookingDoctor && (
        <DoctorVisitScheduler
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onJoinWaitlist={() => {
            const doctor = bookingDoctor
            setBookingDoctor(null)
            setWaitlistDoctor(doctor)
          }}
        />
      )}

      {waitlistDoctor && (
        <DoctorWaitlistForm
          doctor={waitlistDoctor}
          onClose={() => setWaitlistDoctor(null)}
        />
      )}
    </>
  )
}

export default DoctorsPage
