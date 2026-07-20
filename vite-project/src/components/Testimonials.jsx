const testimonials = [
  {
    quote:
      'The staff was incredibly kind and professional. Dr. Mitchell took the time to explain everything clearly. I felt truly cared for.',
    name: 'Lisa Thompson',
    role: 'Cardiology Patient',
    rating: 5,
  },
  {
    quote:
      'Booking was easy and the wait time was minimal. The clinic is clean and modern. Highly recommend for family healthcare.',
    name: 'David Park',
    role: 'Pediatrics Patient',
    rating: 5,
  },
  {
    quote:
      'After my knee surgery, the orthopedic team guided me through recovery with patience and expertise. Excellent care all around.',
    name: 'Maria Santos',
    role: 'Orthopedics Patient',
    rating: 5,
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="section testimonials">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Testimonials</span>
          <h2>What Our Patients Say</h2>
          <p>Real stories from people who trust us with their health.</p>
        </div>
        <div className="testimonials__grid">
          {testimonials.map((item) => (
            <article key={item.name} className="testimonial-card">
              <div className="testimonial-card__stars" aria-label={`${item.rating} out of 5 stars`}>
                {'★'.repeat(item.rating)}
              </div>
              <blockquote>&ldquo;{item.quote}&rdquo;</blockquote>
              <footer>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
