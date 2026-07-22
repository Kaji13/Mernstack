import ScrollReveal from '../hooks/ScrollReveal'

const reasons = [
  {
    icon: '🏥',
    title: 'Modern Facilities',
    description: 'State-of-the-art equipment and clean, comfortable treatment rooms.',
  },
  {
    icon: '👨‍⚕️',
    title: 'Expert Physicians',
    description: 'Highly qualified doctors with years of clinical experience.',
  },
  {
    icon: '⏱️',
    title: 'Minimal Wait Times',
    description: 'Efficient scheduling so you spend less time waiting.',
  },
  {
    icon: '💊',
    title: 'Affordable Care',
    description: 'Transparent pricing and flexible payment options for all patients.',
  },
]

function WhyChooseUs() {
  return (
    <section id="about" className="section why-choose">
      <div className="container why-choose__inner">
        <ScrollReveal className="why-choose__content">
          <span className="section__label">Why Choose Us</span>
          <h2>Healthcare You Can Trust</h2>
          <p>
            At MediCare Clinic, we combine medical excellence with a patient-first
            approach. Our team is committed to delivering personalized care in a
            welcoming environment.
          </p>
          <ul className="why-choose__list">
            {reasons.map((reason) => (
              <li key={reason.title}>
                <span className="why-choose__icon">{reason.icon}</span>
                <div>
                  <strong>{reason.title}</strong>
                  <p>{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollReveal>
        <ScrollReveal className="why-choose__visual" delay={120} aria-hidden="true">
          <div className="why-choose__image">
            <div className="why-choose__image-badge">Certified Excellence</div>
            <span>🏥</span>
            <p>Patient-Centered Care</p>
            <div className="why-choose__stats-mini">
              <div><strong>ISO</strong><span>Certified</span></div>
              <div><strong>A+</strong><span>Safety Rating</span></div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

export default WhyChooseUs
