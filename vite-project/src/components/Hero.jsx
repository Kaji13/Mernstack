function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-section__inner">
        <div className="hero-section__content">
          <span className="hero-section__badge">Trusted Healthcare Since 2005</span>
          <h1>Your Health, Our Priority</h1>
          <p>
            Comprehensive medical care with experienced doctors, modern facilities,
            and compassionate support for you and your family.
          </p>
          <div className="hero-section__actions">
            <a href="#appointment" className="btn btn--primary">
              Book an Appointment
            </a>
            <a href="#services" className="btn btn--outline">
              View Services
            </a>
          </div>
          <div className="hero-section__features">
            <div>
              <strong>24/7</strong>
              <span>Emergency Care</span>
            </div>
            <div>
              <strong>50+</strong>
              <span>Specialists</span>
            </div>
            <div>
              <strong>15k+</strong>
              <span>Happy Patients</span>
            </div>
          </div>
        </div>
        <div className="hero-section__visual" aria-hidden="true">
          <div className="hero-section__card hero-section__card--main">
            <div className="hero-section__card-icon">🩺</div>
            <p>Expert Medical Team</p>
          </div>
          <div className="hero-section__card hero-section__card--float">
            <span className="hero-section__pulse" />
            <p>Open Now</p>
            <small>Mon – Sat, 8 AM – 8 PM</small>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
