import { useState } from 'react'
import { scrollToId } from '../lib/scroll'
import { contact } from '../data'

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
          <div className="footer__col">
            <h5>Explore</h5>
            <ul>
              <li>
                <a href="#destinations" onClick={go('#destinations')}>
                  Destinations
                </a>
              </li>
              <li>
                <a href="#way" onClick={go('#way')}>
                  How we travel
                </a>
              </li>
              <li>
                <a href="#spotlight" onClick={go('#spotlight')}>
                  Journey of the month
                </a>
              </li>
              <li>
                <a href="#postcards" onClick={go('#postcards')}>
                  Postcards
                </a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Company</h5>
            <ul>
              <li>
                <a href="#story" onClick={go('#story')}>
                  Our story
                </a>
              </li>
              <li>
                <a href="#stories" onClick={go('#stories')}>
                  Traveller stories
                </a>
              </li>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  Trip planners
                </a>
              </li>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  Careers
                </a>
              </li>
            </ul>
          </div>
          <div className="footer__col">
            <h5>Good to know</h5>
            <ul>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  Booking & payments
                </a>
              </li>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  Cancellation policy
                </a>
              </li>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  Travel insurance
                </a>
              </li>
              <li>
                <a href="#enquiry" onClick={go('#enquiry')}>
                  FAQs
                </a>
              </li>
            </ul>
          </div>
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
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('#top')
              }}
            >
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
