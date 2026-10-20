import { useEffect, useState } from 'react'
import { lockScroll, scrollToId, unlockScroll } from '../lib/scroll'
import { contact } from '../data'

const links = [
  ['Destinations', '#destinations', '01'],
  ['The Trip Tastic way', '#way', '02'],
  ['Spotlight', '#spotlight', '03'],
  ['Postcards', '#postcards', '04'],
  ['Stories', '#stories', '05'],
]

export default function Nav() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    lockScroll()
    return () => unlockScroll()
  }, [open])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = (id) => (e) => {
    e.preventDefault()
    setOpen(false)
    setTimeout(() => scrollToId(id), 80)
  }

  return (
    <>
      <header className={`nav ${stuck ? 'is-stuck' : ''} ${open ? 'is-open' : ''}`}>
        <div className="nav__inner shell">
          <a href="#top" className="nav__brand" onClick={go('#top')} aria-label="Trip Tastic Holidays — home">
            <span className="nav__mark">
              <img src="/brand/emblem.webp" alt="" width="52" height="52" />
            </span>
            <span className="nav__word">
              <b>Trip Tastic</b>
              <small>Holidays</small>
            </span>
          </a>

          <nav className="nav__links" aria-label="Primary">
            {links.map(([label, href]) => (
              <a key={href} className="nav__link" href={href} onClick={go(href)}>
                {label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <a className="nav__phone" href={contact.phoneHref}>
              {contact.phone}
            </a>
            <a className="btn btn--sm nav__cta" href="#enquiry" onClick={go('#enquiry')}>
              Plan my trip
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </a>
            <button
              type="button"
              className="nav__burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} id="mobile-menu" aria-hidden={!open}>
        <div className="menu__links">
          {links.map(([label, href, num], i) => (
            <a
              key={href}
              href={href}
              className="menu__link"
              onClick={go(href)}
              style={{ transitionDelay: open ? `${0.18 + i * 0.06}s` : '0s' }}
              tabIndex={open ? 0 : -1}
            >
              <i>{num}</i>
              <span>{label}</span>
            </a>
          ))}
          <a
            href="#enquiry"
            className="menu__link"
            onClick={go('#enquiry')}
            style={{ transitionDelay: open ? `${0.18 + links.length * 0.06}s` : '0s' }}
            tabIndex={open ? 0 : -1}
          >
            <i>06</i>
            <span>
              Plan <em>my trip</em>
            </span>
          </a>
        </div>

        <div className="menu__foot">
          <div>
            <strong>Talk to a human</strong>
            <a href={contact.phoneHref}>{contact.phone}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div className="menu__socials">
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={contact.phoneHref}>Call</a>
          </div>
        </div>
      </div>
    </>
  )
}
