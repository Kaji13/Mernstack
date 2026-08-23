import { useState } from 'react'
import ScrollReveal from '../hooks/ScrollReveal'
import { useHomeData } from '../context/HomeDataContext'

function FAQs() {
  const { data } = useHomeData()
  const faqs = data.faqs
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="section faqs">
      <div className="container">
        <ScrollReveal className="section__header">
          <span className="section__label">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Find answers to common questions about our services and policies.</p>
        </ScrollReveal>
        <ScrollReveal className="faqs__list" delay={80}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            return (
              <article key={faq.question} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
                <button
                  type="button"
                  className="faq-item__question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  <span className="faq-item__number">{String(index + 1).padStart(2, '0')}</span>
                  {faq.question}
                  <span className="faq-item__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
                <div className="faq-item__answer-wrap" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div className="faq-item__answer">{faq.answer}</div>
                </div>
              </article>
            )
          })}
        </ScrollReveal>
      </div>
    </section>
  )
}

export default FAQs
