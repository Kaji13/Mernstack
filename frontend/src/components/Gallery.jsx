import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function Gallery() {
  const { data } = useHomeData()
  const galleryItems = data.gallery

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
