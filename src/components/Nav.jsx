import { useEffect, useState } from 'react'
import { lockScroll, scrollToId, unlockScroll } from '../lib/scroll'
import { contact, destinations } from '../data'

const links = [
  ['Destinations', '#destinations', '01'],
  ['The House', '#story', '02'],
  ['The Way', '#way', '03'],
  ['Routes', '#routes', '04'],
  ['Spotlight', '#spotlight', '05'],
  ['Postcards', '#postcards', '06'],
  ['Stories', '#stories', '07'],
]

const notices = [
  ['Now booking', 'Winter & Spring 2026'],
  ['Private journeys', 'India & beyond'],
  ['4.9 / 5', 'from 4,800+ travellers'],
  ['Concierge', '+91 90000 12345'],
]

export default function Nav() {
  const [stuck, setStuck] = useState(false)
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(0)

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 60)
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
    setTimeout(() => scrollToId(id), 90)
  }

  const previews = destinations.slice(0, 7).map((d) => ({ id: d.id, src: d.image, label: `${d.name} — ${d.region}` }))

  return (
    <>
      <header className={`nav ${stuck ? 'is-stuck' : ''} ${open ? 'is-open' : ''}`}>
        <div className="nav__notice" aria-hidden="true">
          <div className="nav__notice-track">
            {[0, 1].map((g) => (
              <div className="nav__notice-group" key={g}>
                {notices.map(([strong, rest]) => (
                  <span className="nav__notice-item" key={strong}>
                    <b>{strong}</b>
                    {rest}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="nav__bar shell">
          <nav className="nav__group nav__group--left" aria-label="Primary">
            {links.slice(0, 4).map(([label, href]) => (
              <a key={href} className="nav__link" href={href} onClick={go(href)}>
                {label}
              </a>
            ))}
          </nav>

          <a href="#top" className="nav__crest" onClick={go('#top')} aria-label="Trip Tastic Holidays — home">
            <span className="nav__mark">
              <img src="/brand/emblem.webp" alt="" width="46" height="46" />
            </span>
            <span className="nav__word">
              <b>Trip Tastic</b>
              <small>Holidays</small>
            </span>
          </a>

          <div className="nav__actions">
            <nav className="nav__group nav__group--right" aria-label="Secondary">
              {links.slice(4).map(([label, href]) => (
                <a key={href} className="nav__link" href={href} onClick={go(href)}>
                  {label}
                </a>
              ))}
            </nav>
            <a className="nav__phone" href={contact.phoneHref}>
              {contact.phone}
            </a>
            <a className="btn btn--sm nav__cta" href="#enquiry" onClick={go('#enquiry')}>
              Plan my journey
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
        <div className="menu__body">
          <div>
            <div className="menu__rule" />
            <nav className="menu__links" aria-label="Menu">
              {links.map(([label, href, num], i) => (
                <a
                  key={href}
                  href={href}
                  className="menu__link"
                  onClick={go(href)}
                  onMouseEnter={() => setPreview(i)}
                  onFocus={() => setPreview(i)}
                  style={{ transitionDelay: open ? `${0.16 + i * 0.055}s` : '0s' }}
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
                onMouseEnter={() => setPreview(0)}
                style={{ transitionDelay: open ? `${0.16 + links.length * 0.055}s` : '0s' }}
                tabIndex={open ? 0 : -1}
              >
                <i>08</i>
                <span>
                  Plan <em>my journey</em>
                </span>
              </a>
            </nav>
          </div>

          <div className="menu__foot">
            <div>
              <strong>Concierge</strong>
              <a href={contact.phoneHref}>{contact.phone}</a> · <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </div>
            <div>
              <strong>The studio</strong>
              {contact.address}
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

        <div className="menu__preview" aria-hidden="true">
          {previews.map((p, i) => (
            <img key={p.id} src={p.src} alt="" className={i === preview ? 'is-active' : ''} />
          ))}
          <span className="menu__preview-label">{previews[preview]?.label}</span>
        </div>
      </div>
    </>
  )
}
