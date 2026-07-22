import ScrollReveal from '../hooks/ScrollReveal'

const services = [
  {
    icon: '🫀',
    title: 'Cardiology',
    description: 'Heart health screenings, diagnostics, and personalized treatment plans.',
  },
  {
    icon: '🦴',
    title: 'Orthopedics',
    description: 'Bone, joint, and muscle care with advanced rehabilitation support.',
  },
  {
    icon: '👶',
    title: 'Pediatrics',
    description: 'Gentle, specialized healthcare for infants, children, and teens.',
  },
  {
    icon: '🦷',
    title: 'Dental Care',
    description: 'Preventive, cosmetic, and restorative dentistry under one roof.',
  },
  {
    icon: '👁️',
    title: 'Eye Care',
    description: 'Vision testing, eye disease management, and surgical options.',
  },
  {
    icon: '🧪',
    title: 'Laboratory',
    description: 'Accurate lab tests with fast turnaround and digital reports.',
  },
]

function Services() {
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
                <a href="#appointment" className="service-card__link">
                  Learn more
                  <span aria-hidden="true">→</span>
                </a>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services
