const stats = [
  { value: '15,000+', label: 'Patients Treated' },
  { value: '50+', label: 'Medical Specialists' },
  { value: '20+', label: 'Years of Service' },
  { value: '98%', label: 'Patient Satisfaction' },
]

function Statistics() {
  return (
    <section className="statistics">
      <div className="container statistics__grid">
        {stats.map((stat) => (
          <div key={stat.label} className="statistics__item">
            <span className="statistics__value">{stat.value}</span>
            <span className="statistics__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Statistics
