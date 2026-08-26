import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/#about', label: 'About' },
  { to: '/#testimonials', label: 'Testimonials' },
  { to: '/#gallery', label: 'Gallery' },
  { to: '/#faq', label: 'FAQ' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          MediCare Clinic
        </Link>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
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
              <li key={link.to}>
                {link.to.startsWith('/#') ? (
                  <a href={link.to} onClick={closeMenu}>
                    {link.label}
                  </a>
                ) : (
                  <NavLink
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => (isActive ? 'active' : undefined)}
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
          <Link to="/#appointment" className="btn btn--primary navbar__cta" onClick={closeMenu}>
            Book Appointment
          </Link>
        </nav>
      </div>
      {menuOpen && <div className="navbar__overlay" onClick={closeMenu} aria-hidden="true" />}
    </header>
  )
}

export default Navbar
