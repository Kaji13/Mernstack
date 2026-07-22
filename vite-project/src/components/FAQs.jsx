import { useState } from 'react'
import ScrollReveal from '../hooks/ScrollReveal'

const faqs = [
  {
    question: 'What are your clinic hours?',
    answer:
      'We are open Monday through Saturday, 8:00 AM to 8:00 PM. Emergency services are available 24/7.',
  },
  {
    question: 'Do I need an appointment to visit?',
    answer:
      'Walk-ins are welcome for general consultations, but we recommend booking an appointment to reduce wait times.',
  },
  {
    question: 'Which insurance plans do you accept?',
    answer:
      'We accept most major insurance providers. Contact our front desk to verify your specific plan coverage.',
  },
  {
    question: 'How do I get my lab results?',
    answer:
      'Lab results are typically available within 24–48 hours. You can access them online or collect a printed copy at reception.',
  },
  {
    question: 'Is parking available at the clinic?',
    answer:
      'Yes, we offer free parking for all patients and visitors in our dedicated clinic parking lot.',
  },
]

function FAQs() {
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
