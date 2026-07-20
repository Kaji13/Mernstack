function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="#home" className="navbar__logo">
            <span className="navbar__logo-icon" aria-hidden="true">+</span>
            MediCare Clinic
          </a>
          <p>
            Providing compassionate, quality healthcare for you and your loved ones
            since 2005.
          </p>
        </div>
        <div className="footer__links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#services">Services</a></li>
            <li><a href="#doctors">Doctors</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#appointment">Book Appointment</a></li>
          </ul>
        </div>
        <div className="footer__links">
          <h4>Contact</h4>
          <ul>
            <li>123 Health Street</li>
            <li>Medical City, MC 10001</li>
            <li>+1 (555) 123-4567</li>
            <li>hello@medicareclinic.com</li>
          </ul>
        </div>
        <div className="footer__links">
          <h4>Hours</h4>
          <ul>
            <li>Mon – Fri: 8 AM – 8 PM</li>
            <li>Saturday: 9 AM – 5 PM</li>
            <li>Sunday: Closed</li>
            <li>Emergency: 24/7</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
