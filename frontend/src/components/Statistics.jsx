import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useHomeData } from '../context/HomeDataContext'

function StatItem({ stat, index }) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)
  const display = useCountUp(stat.value, active)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.5 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="statistics__item reveal reveal--visible" style={{ transitionDelay: `${index * 100}ms` }}>
      <span className="statistics__value">{display}</span>
      <span className="statistics__label">{stat.label}</span>
    </div>
  )
}

function Statistics() {
  const { data } = useHomeData()
  const stats = data.statistics

  return (
    <section className="statistics">
      <div className="statistics__pattern" aria-hidden="true" />
      <div className="container statistics__grid">
        {stats.map((stat, index) => (
          <StatItem key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </section>
  )
}

export default Statistics
