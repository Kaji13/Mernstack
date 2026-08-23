import { Link } from 'react-router-dom'
import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function Services() {
  const { data } = useHomeData()
  const services = data.services

  return (
    <section id="services" className="section services">
      <div className="container">
        <ScrollReveal className="section__header">
          <span className="section__label">Our Services</span>
          <h2>Comprehensive Care for Every Need</h2>
          <p>
            From routine checkups to specialized treatments, we offer a wide range
            of medical services to keep you healthy.
          </p>
        </ScrollReveal>
        <div className="services__grid">
          {services.map((service, index) => (
            <ScrollReveal key={service.title} delay={index * 80}>
              <article className="service-card">
                <div className="service-card__icon-wrap">
                  <span className="service-card__icon">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to="/services" className="service-card__link">
                  Learn more
                  <span aria-hidden="true">→</span>
                </Link>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal className="services__footer" delay={services.length * 80}>
          <Link to="/services" className="btn btn--outline">
            View all services
            <span aria-hidden="true">→</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Services
