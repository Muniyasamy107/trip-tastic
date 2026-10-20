import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_LINKS } from '../data/content'
import { getLenis, scrollToId, scrollToTop } from '../lib/smoothScroll'
import Magnetic from './ui/Magnetic'
import { Arrow } from './ui/Reveal'
import { EASE } from '../lib/motion'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.body.classList.add('menu-open')
    } else {
      lenis?.start()
      document.body.classList.remove('menu-open')
    }
    return () => {
      document.body.classList.remove('menu-open')
    }
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleAnchor = (e, href) => {
    e.preventDefault()
    setOpen(false)
    window.setTimeout(() => {
      if (href === '#top') scrollToTop()
      else scrollToId(href)
    }, open ? 260 : 0)
  }

  return (
    <>
      <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a
          href="#top"
          className="nav-brand"
          onClick={(e) => handleAnchor(e, '#top')}
          aria-label="TripTastic Holidays — back to top"
        >
          <img src="/images/logo.jpeg" alt="" className="nav-logo" />
          <span className="nav-brand-text">
            <strong>TripTastic</strong>
            <em>Holidays</em>
          </span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleAnchor(e, link.href)}
              className="nav-link"
            >
              <span>{link.label}</span>
              <span className="nav-link-line" aria-hidden="true" />
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <span className="nav-phone">+91 98765 43210</span>
          <Magnetic strength={0.2}>
            <a
              href="#plan"
              className="btn btn--primary btn--sm"
              onClick={(e) => handleAnchor(e, '#plan')}
            >
              Plan a trip
              <Arrow size={14} />
            </a>
          </Magnetic>

          <button
            type="button"
            className={`nav-burger ${open ? 'is-open' : ''}`}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            initial={{ opacity: 0, y: '-4%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-4%' }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="menu-glow" aria-hidden="true" />
            <nav className="menu-links" aria-label="Mobile">
              {[...NAV_LINKS, { label: 'Plan a trip', href: '#plan' }].map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.7, ease: EASE }}
                >
                  <span className="menu-index">0{i + 1}</span>
                  {link.label}
                </motion.a>
              ))}
            </nav>

            <motion.div
              className="menu-foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <div>
                <span className="menu-label">Talk to a human</span>
                <a href="mailto:hello@triptastic.in">hello@triptastic.in</a>
              </div>
              <div>
                <span className="menu-label">On the ground</span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </div>
              <div className="menu-socials">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer">
                  YouTube
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
