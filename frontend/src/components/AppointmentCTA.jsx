import { useState } from 'react'
import ScrollReveal from '../hooks/ScrollReveal'

function AppointmentCTA() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="appointment" className="section appointment">
      <div className="appointment__pattern" aria-hidden="true" />
      <div className="container appointment__inner">
        <ScrollReveal className="appointment__content">
          <span className="section__label section__label--light">Book Now</span>
          <h2>Schedule Your Appointment</h2>
          <p>
            Take the first step toward better health. Fill out the form and our
            team will confirm your visit within 24 hours.
          </p>
          <ul className="appointment__info">
            <li>
              <span className="appointment__info-icon">📞</span>
              <div>
                <strong>Call Us</strong>
                <span>+1 (555) 123-4567</span>
              </div>
            </li>
            <li>
              <span className="appointment__info-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <span>hello@medicareclinic.com</span>
              </div>
            </li>
            <li>
              <span className="appointment__info-icon">📍</span>
              <div>
                <strong>Location</strong>
                <span>123 Health Street, Medical City</span>
              </div>
            </li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={120}>
          <form className="appointment__form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="appointment__success">
                <span>✓</span>
                <h3>Request Received!</h3>
                <p>We will contact you shortly to confirm your appointment.</p>
              </div>
            ) : (
              <>
                <h3 className="appointment__form-title">Quick Booking Form</h3>
                <div className="form-row">
                  <label>
                    Full Name
                    <input type="text" name="name" placeholder="John Doe" required />
                  </label>
                  <label>
                    Phone Number
                    <input type="tel" name="phone" placeholder="+1 (555) 000-0000" required />
                  </label>
                </div>
                <div className="form-row">
                  <label>
                    Email
                    <input type="email" name="email" placeholder="john@email.com" required />
                  </label>
                  <label>
                    Department
                    <select name="department" required defaultValue="">
                      <option value="" disabled>Select department</option>
                      <option value="general">General Medicine</option>
                      <option value="cardiology">Cardiology</option>
                      <option value="orthopedics">Orthopedics</option>
                      <option value="pediatrics">Pediatrics</option>
                      <option value="dental">Dental Care</option>
                    </select>
                  </label>
                </div>
                <label>
                  Preferred Date
                  <input type="date" name="date" required />
                </label>
                <label>
                  Message (optional)
                  <textarea name="message" rows="3" placeholder="Describe your symptoms or concerns..." />
                </label>
                <button type="submit" className="btn btn--primary btn--full">
                  Request Appointment
                </button>
              </>
            )}
          </form>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default AppointmentCTA
