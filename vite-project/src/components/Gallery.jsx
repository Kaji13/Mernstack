import ScrollReveal from '../hooks/ScrollReveal'

const galleryItems = [
  { label: 'Reception Area', gradient: 'linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%)', icon: '🛋️' },
  { label: 'Consultation Room', gradient: 'linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%)', icon: '🩺' },
  { label: 'Laboratory', gradient: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 100%)', icon: '🧪' },
  { label: 'Waiting Lounge', gradient: 'linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)', icon: '☕' },
  { label: 'Surgery Suite', gradient: 'linear-gradient(135deg, #ccfbf1 0%, #5eead4 100%)', icon: '💉' },
  { label: 'Pharmacy', gradient: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)', icon: '💊' },
]

function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <ScrollReveal className="section__header">
          <span className="section__label">Gallery</span>
          <h2>Our Clinic</h2>
          <p>Take a look at our modern, patient-friendly facilities.</p>
        </ScrollReveal>
        <div className="gallery__grid">
          {galleryItems.map((item, index) => (
            <ScrollReveal key={item.label} delay={index * 70}>
              <figure className="gallery__item">
                <div className="gallery__placeholder" style={{ background: item.gradient }}>
                  <span className="gallery__icon">{item.icon}</span>
                  <div className="gallery__overlay">
                    <span>View</span>
                  </div>
                </div>
                <figcaption>{item.label}</figcaption>
              </figure>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
