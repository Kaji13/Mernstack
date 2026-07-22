import ScrollReveal from '../hooks/ScrollReveal'

const testimonials = [
  {
    quote:
      'The staff was incredibly kind and professional. Dr. Mitchell took the time to explain everything clearly. I felt truly cared for.',
    name: 'Lisa Thompson',
    role: 'Cardiology Patient',
    initials: 'LT',
    rating: 5,
  },
  {
    quote:
      'Booking was easy and the wait time was minimal. The clinic is clean and modern. Highly recommend for family healthcare.',
    name: 'David Park',
    role: 'Pediatrics Patient',
    initials: 'DP',
    rating: 5,
    featured: true,
  },
  {
    quote:
      'After my knee surgery, the orthopedic team guided me through recovery with patience and expertise. Excellent care all around.',
    name: 'Maria Santos',
    role: 'Orthopedics Patient',
    initials: 'MS',
    rating: 5,
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <ScrollReveal className="section__header">
          <span className="section__label">Testimonials</span>
          <h2>What Our Patients Say</h2>
          <p>Real stories from people who trust us with their health.</p>
        </ScrollReveal>
        <div className="testimonials__grid">
          {testimonials.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 100}>
              <article className={`testimonial-card ${item.featured ? 'testimonial-card--featured' : ''}`}>
                <span className="testimonial-card__quote" aria-hidden="true">&ldquo;</span>
                <div className="testimonial-card__stars" aria-label={`${item.rating} out of 5 stars`}>
                  {'★'.repeat(item.rating)}
                </div>
                <blockquote>{item.quote}</blockquote>
                <footer>
                  <div className="testimonial-card__avatar">{item.initials}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.role}</span>
                  </div>
                </footer>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
