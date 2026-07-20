import { useState } from 'react'

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#services', label: 'Services' },
  { href: '#doctors', label: 'Doctors' },
  { href: '#about', label: 'About' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#faq', label: 'FAQ' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <a href="#home" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon" aria-hidden="true">+</span>
          MediCare Clinic
        </a>

        <button
          type="button"
          className="navbar__toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={closeMenu}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#appointment" className="btn btn--primary navbar__cta" onClick={closeMenu}>
            Book Appointment
          </a>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
