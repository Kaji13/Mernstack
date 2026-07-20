const galleryItems = [
  { label: 'Reception Area', color: '#e8f4fc' },
  { label: 'Consultation Room', color: '#dceef8' },
  { label: 'Laboratory', color: '#d0e8f4' },
  { label: 'Waiting Lounge', color: '#c4e2f0' },
  { label: 'Surgery Suite', color: '#b8dcec' },
  { label: 'Pharmacy', color: '#acd6e8' },
]

function Gallery() {
  return (
    <section id="gallery" className="section gallery">
      <div className="container">
        <div className="section__header">
          <span className="section__label">Gallery</span>
          <h2>Our Clinic</h2>
          <p>Take a look at our modern, patient-friendly facilities.</p>
        </div>
        <div className="gallery__grid">
          {galleryItems.map((item) => (
            <figure key={item.label} className="gallery__item">
              <div className="gallery__placeholder" style={{ background: item.color }}>
                <span>🏥</span>
              </div>
              <figcaption>{item.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery
