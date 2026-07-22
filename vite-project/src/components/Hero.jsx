import ScrollReveal from '../hooks/ScrollReveal'

function Hero() {
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
            Trusted Healthcare Since 2005
          </span>
          <h1>
            Your Health,{' '}
            <span className="hero-section__highlight">Our Priority</span>
          </h1>
          <p>
            Comprehensive medical care with experienced doctors, modern facilities,
            and compassionate support for you and your family.
          </p>
          <div className="hero-section__actions">
            <a href="#appointment" className="btn btn--primary btn--lg">
              Book an Appointment
              <span aria-hidden="true">→</span>
            </a>
            <a href="#services" className="btn btn--glass">
              View Services
            </a>
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
                <strong>50+</strong>
                <span>Specialists</span>
              </div>
            </div>
            <div className="hero-section__feature">
              <span className="hero-section__feature-icon">❤️</span>
              <div>
                <strong>15k+</strong>
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
            <p>Open Now</p>
            <small>Mon – Sat, 8 AM – 8 PM</small>
          </div>
          <div className="hero-section__card hero-section__card--float hero-section__card--rating">
            <div className="hero-section__stars">★★★★★</div>
            <p>4.9 / 5.0</p>
            <small>2,400+ reviews</small>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default Hero
