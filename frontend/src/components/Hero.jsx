import { Link } from 'react-router-dom'
import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function Hero() {
  const { data } = useHomeData()
  const { clinic } = data
  const hero = clinic.hero

  return (
    <section id="home" className="hero-section">
      <div className="hero-section__bg" aria-hidden="true">
        <div className="hero-section__blob hero-section__blob--1" />
        <div className="hero-section__blob hero-section__blob--2" />
        <div className="hero-section__grid" />
      </div>

      <div className="container hero-section__inner">
        <ScrollReveal className="hero-section__content">
          <span className="hero-section__badge">
            <span className="hero-section__badge-dot" />
            {hero.badge}
          </span>
          <h1>
            {hero.title.split(',')[0]},{' '}
            <span className="hero-section__highlight">
              {hero.title.includes(',') ? hero.title.split(',')[1].trim() : hero.title}
            </span>
          </h1>
          <p>{hero.subtitle}</p>
          <div className="hero-section__actions">
            <a href="#appointment" className="btn btn--primary btn--lg">
              Book an Appointment
              <span aria-hidden="true">→</span>
            </a>
            <Link to="/services" className="btn btn--glass">
              View Services
            </Link>
          </div>
          <div className="hero-section__features">
            <div className="hero-section__feature">
              <span className="hero-section__feature-icon">🚨</span>
              <div>
                <strong>24/7</strong>
                <span>Emergency Care</span>
              </div>
            </div>
            <div className="hero-section__feature">
              <span className="hero-section__feature-icon">👨‍⚕️</span>
              <div>
                <strong>{data.statistics[1]?.value || '50+'}</strong>
                <span>Specialists</span>
              </div>
            </div>
            <div className="hero-section__feature">
              <span className="hero-section__feature-icon">❤️</span>
              <div>
                <strong>{data.statistics[0]?.value || '15k+'}</strong>
                <span>Happy Patients</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal className="hero-section__visual" delay={150} aria-hidden="true">
          <div className="hero-section__ring hero-section__ring--outer" />
          <div className="hero-section__ring hero-section__ring--inner" />
          <div className="hero-section__card hero-section__card--main">
            <div className="hero-section__card-icon">🩺</div>
            <p>Expert Medical Team</p>
            <small>Board-certified specialists</small>
          </div>
          <div className="hero-section__card hero-section__card--float hero-section__card--status">
            <span className="hero-section__pulse" />
            <p>{hero.isOpen ? 'Open Now' : 'Closed'}</p>
            <small>{hero.openHours}</small>
          </div>
          <div className="hero-section__card hero-section__card--float hero-section__card--rating">
            <div className="hero-section__stars">★★★★★</div>
            <p>{hero.rating} / 5.0</p>
            <small>{hero.reviewCount.toLocaleString()}+ reviews</small>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Hero
