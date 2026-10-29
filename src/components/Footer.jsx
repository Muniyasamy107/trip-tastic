import { useState } from 'react'
import { scrollToId } from '../lib/scroll'
import { contact, footerCols } from '../data'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const subscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setDone(true)
    setEmail('')
  }

  const go = (id) => (e) => {
    e.preventDefault()
    scrollToId(id)
  }

  return (
    <footer className="footer" id="contact">
      <div className="shell">
        <div className="footer__top">
          <div>
            <a className="footer__brand" href="#top" onClick={go('#top')} aria-label="Trip Tastic Holidays home">
              <img src="/brand/emblem.webp" alt="" loading="lazy" />
              <span>
                <b>Trip Tastic</b>
                <span>Holidays</span>
              </span>
            </a>
            <p className="footer__tagline">
              Handcrafted journeys across India and beyond. Chennai-born, world-curious, allergic to
              cookie-cutter tours.
            </p>
          </div>

          <div className="footer__news">
            <h4>The Sunday Postcard</h4>
            <p>One beautifully shot place, one honest tip, once a week. No fare alerts, we promise.</p>
            {done ? (
              <p className="newsletter__done">You’re in — the first postcard lands this Sunday. ✈</p>
            ) : (
              <form className="newsletter" onSubmit={subscribe}>
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  aria-label="Email for the Sunday Postcard"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" aria-label="Subscribe">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="footer__cols">
          {footerCols.map((col) => (
            <div className="footer__col" key={col.title}>
              <h5>{col.title}</h5>
              <ul>
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} onClick={go(href)}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer__col">
            <h5>Say hello</h5>
            <ul>
              <li>
                <a href={contact.phoneHref}>{contact.phone}</a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              <li>
                <address>{contact.address}</address>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Trip Tastic Holidays · Crafted in Chennai, India</span>
          <div className="footer__socials">
            <a href={contact.instagram} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp ↗
            </a>
            <a href="/design/" target="_blank" rel="noreferrer">
              Hero design file ↗
            </a>
            <a href="#top" onClick={go('#top')}>
              Back to top ↑
            </a>
          </div>
        </div>
      </div>

      <div className="footer__wordmark" aria-hidden="true">
        Trip <em>Tastic</em>
      </div>
    </footer>
  )
}
