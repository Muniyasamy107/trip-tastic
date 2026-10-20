import { useState } from 'react'
import { motion } from 'framer-motion'
import { NAV_LINKS } from '../data/content'
import { scrollToId, scrollToTop } from '../lib/smoothScroll'
import { Arrow, Reveal } from './ui/Reveal'

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'WhatsApp', href: 'https://wa.me/919876543210' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const go = (e, href) => {
    e.preventDefault()
    scrollToId(href)
  }

  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-top">
          <Reveal className="footer-brand">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                scrollToTop()
              }}
              className="footer-logo"
              aria-label="TripTastic Holidays"
            >
              <img src="/images/logo.jpeg" alt="" />
            </a>
            <p>
              Small-group expeditions and private journeys across India and the world.
              Built by people who’d rather be on the road.
            </p>
            <div className="footer-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                  <Arrow size={12} />
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal className="footer-col" delay={0.05}>
            <h4>Explore</h4>
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={(e) => go(e, l.href)}>
                {l.label}
              </a>
            ))}
            <a href="#plan" onClick={(e) => go(e, '#plan')}>
              Plan a trip
            </a>
          </Reveal>

          <Reveal className="footer-col" delay={0.1}>
            <h4>Studio</h4>
            <p>
              No. 14, 2nd Cross Street
              <br />
              Besant Nagar, Chennai
              <br />
              Tamil Nadu 600090
            </p>
            <a href="mailto:hello@triptastic.in">hello@triptastic.in</a>
            <a href="tel:+919876543210">+91 98765 43210</a>
          </Reveal>

          <Reveal className="footer-col footer-news" delay={0.15}>
            <h4>Field notes</h4>
            <p>One letter a month: new routes, off-season windows, and things worth knowing.</p>
            <form
              className="news-form"
              onSubmit={(e) => {
                e.preventDefault()
                if (!email.trim()) return
                setDone(true)
                setEmail('')
              }}
            >
              <label className="sr-only" htmlFor="news-email">
                Email address
              </label>
              <input
                id="news-email"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setDone(false)
                }}
                required
              />
              <button type="submit" aria-label="Subscribe">
                <Arrow size={16} />
              </button>
            </form>
            {done && <span className="news-done">Subscribed — see you next month.</span>}
          </Reveal>
        </div>

        <div className="footer-wordmark" aria-hidden="true">
          <motion.span
            initial={{ y: 90, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-5%' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            TripTastic
          </motion.span>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} TripTastic Holidays. All rights reserved.</span>
          <span className="footer-bottom-mid">Crafted in Chennai · Explore responsibly</span>
          <div>
            <a href="#top" onClick={(e) => { e.preventDefault(); scrollToTop() }}>
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
