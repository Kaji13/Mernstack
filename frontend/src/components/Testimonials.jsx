import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function Testimonials() {
  const { data } = useHomeData()
  const testimonials = data.testimonials

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
