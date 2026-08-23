import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BackToTop from '../components/BackToTop'
import ScrollReveal from '../hooks/ScrollReveal'
import {
  serviceCategories,
  servicesCatalog,
  careProcess,
  serviceHighlights,
} from '../data/servicesPageData'
import './ServicesPage.css'

function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return servicesCatalog.filter((service) => {
      const matchesCategory = activeCategory === 'all' || service.category === activeCategory
      const matchesSearch =
        !query ||
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.features.some((f) => f.toLowerCase().includes(query))
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, searchQuery])

  return (
    <>
      <Navbar />
      <main className="services-page">
        <section className="services-page__hero">
          <div className="services-page__hero-bg" aria-hidden="true">
            <div className="services-page__hero-blob services-page__hero-blob--1" />
            <div className="services-page__hero-blob services-page__hero-blob--2" />
            <div className="services-page__hero-grid" />
          </div>
          <div className="container services-page__hero-inner">
            <ScrollReveal>
              <nav className="services-page__breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Services</span>
              </nav>
              <span className="section__label section__label--light">Medical Services</span>
              <h1>World-Class Care, Tailored to You</h1>
              <p>
                Explore our full range of medical services — from preventive checkups to
                specialized treatments — delivered by experienced specialists in modern facilities.
              </p>
              <div className="services-page__hero-stats">
                <div>
                  <strong>{servicesCatalog.length}+</strong>
                  <span>Services offered</span>
                </div>
                <div>
                  <strong>50+</strong>
                  <span>Specialists</span>
                </div>
                <div>
                  <strong>24/7</strong>
                  <span>Emergency care</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="services-page__toolbar section">
          <div className="container">
            <ScrollReveal className="services-page__toolbar-inner">
              <div className="services-page__search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  placeholder="Search services, treatments, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search services"
                />
              </div>
              <div className="services-page__filters" role="tablist" aria-label="Filter by category">
                {serviceCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === cat.id}
                    className={`services-page__filter ${activeCategory === cat.id ? 'services-page__filter--active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="section services-page__catalog">
          <div className="container">
            {filteredServices.length === 0 ? (
              <div className="services-page__empty">
                <span aria-hidden="true">🔍</span>
                <h3>No services found</h3>
                <p>Try adjusting your search or selecting a different category.</p>
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                  }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="services-page__grid">
                {filteredServices.map((service, index) => (
                  <ScrollReveal key={service.id} delay={index * 60}>
                    <article
                      className="services-page__card"
                      style={{ '--service-accent': service.accent }}
                    >
                      {service.popular && <span className="services-page__badge">Popular</span>}
                      <div className="services-page__card-header">
                        <div className="services-page__card-icon">{service.icon}</div>
                        <div>
                          <h3>{service.title}</h3>
                          <span className="services-page__card-category">
                            {serviceCategories.find((c) => c.id === service.category)?.label}
                          </span>
                        </div>
                      </div>
                      <p className="services-page__card-desc">{service.longDescription}</p>
                      <ul className="services-page__features">
                        {service.features.map((feature) => (
                          <li key={feature}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <div className="services-page__card-meta">
                        <span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                          {service.duration}
                        </span>
                        <span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <path d="M16 2v4M8 2v4M3 10h18" />
                          </svg>
                          {service.availability}
                        </span>
                      </div>
                      <Link to="/#appointment" className="btn btn--primary btn--full services-page__card-cta">
                        Book this service
                        <span aria-hidden="true">→</span>
                      </Link>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section services-page__highlights">
          <div className="container">
            <ScrollReveal className="section__header">
              <span className="section__label">Why Choose Us</span>
              <h2>Healthcare You Can Trust</h2>
            </ScrollReveal>
            <div className="services-page__highlights-grid">
              {serviceHighlights.map((item, index) => (
                <ScrollReveal key={item.title} delay={index * 80}>
                  <div className="services-page__highlight">
                    <span className="services-page__highlight-icon">{item.icon}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section services-page__process">
          <div className="container">
            <ScrollReveal className="section__header">
              <span className="section__label">How It Works</span>
              <h2>Your Care Journey in Four Steps</h2>
              <p>From booking to follow-up, we make every step simple and stress-free.</p>
            </ScrollReveal>
            <div className="services-page__process-grid">
              {careProcess.map((step, index) => (
                <ScrollReveal key={step.step} delay={index * 100}>
                  <div className="services-page__process-step">
                    <span className="services-page__process-num">{step.step}</span>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="services-page__cta">
          <div className="container">
            <ScrollReveal className="services-page__cta-inner">
              <div>
                <h2>Ready to get started?</h2>
                <p>
                  Book an appointment today and take the first step toward better health.
                  Our team is here to help you every step of the way.
                </p>
              </div>
              <div className="services-page__cta-actions">
                <Link to="/#appointment" className="btn btn--primary btn--lg">
                  Book Appointment
                  <span aria-hidden="true">→</span>
                </Link>
                <Link to="/" className="btn btn--outline">
                  Back to Home
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}

export default ServicesPage
