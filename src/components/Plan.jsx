import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DESTINATIONS } from '../data/content'
import { EASE } from '../lib/motion'
import { Arrow, Eyebrow, Reveal, SplitLines } from './ui/Reveal'
import Magnetic from './ui/Magnetic'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const WHERE = ['Somewhere warm', 'Mountains', 'Coast', 'Not sure yet']

const initial = {
  name: '',
  email: '',
  phone: '',
  destination: DESTINATIONS[1].location,
  when: 'Oct 2026',
  travellers: '2',
  notes: '',
}

export default function Plan() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState('idle') // idle | sending | sent
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please add your name and a valid email so we can reply.')
      return
    }
    setError('')
    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 1300)
  }

  return (
    <section className="plan" id="plan">
      <div className="plan-glow" aria-hidden="true" />

      <div className="shell plan-shell">
        <div className="plan-copy">
          <Eyebrow>05 — Start here</Eyebrow>
          <SplitLines
            as="h2"
            className="plan-title"
            lines={["Let’s build your", 'next story.']}
          />

          <Reveal delay={0.1}>
            <p className="plan-lede">
              Tell us the shape of the trip you’re imagining. We’ll come back with a
              route, a rough budget and the honest version of what’s possible in your
              dates. No obligation, no spam.
            </p>
          </Reveal>

          <Reveal delay={0.16} className="plan-points">
            {[
              'A reply from a route planner within 24 hours',
              'A draft itinerary before any payment',
              'Private or small-group — your call',
            ].map((point) => (
              <p key={point}>
                <span aria-hidden="true">✦</span>
                {point}
              </p>
            ))}
          </Reveal>

          <Reveal delay={0.22} className="plan-contact">
            <div>
              <span>Studio</span>
              <p>No. 14, Besant Nagar<br />Chennai 600090, India</p>
            </div>
            <div>
              <span>Direct line</span>
              <p>
                <a href="tel:+919876543210">+91 98765 43210</a>
                <a href="mailto:hello@triptastic.in">hello@triptastic.in</a>
              </p>
            </div>
          </Reveal>
        </div>

        <motion.div
          className="plan-card"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 1, ease: EASE }}
        >
          <AnimatePresence mode="wait">
            {status === 'sent' ? (
              <motion.div
                key="sent"
                className="plan-success"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="plan-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path
                      d="M7 17.5l6 6L25 9"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3>Your note is in, {form.name.split(' ')[0]}.</h3>
                <p>
                  A route planner will write to <strong>{form.email}</strong> within 24
                  hours with first thoughts on {form.destination || 'your trip'}.
                </p>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => {
                    setForm(initial)
                    setStatus('idle')
                  }}
                >
                  Send another request
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                className="plan-form"
                onSubmit={submit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35 }}
                noValidate
              >
                <div className="plan-form-head">
                  <h3>Trip enquiry</h3>
                  <span>Step 1 of 1</span>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Your name*</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set('name')}
                      placeholder="Ananya Raman"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Email*</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@email.com"
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Phone / WhatsApp</span>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="+91 —"
                      autoComplete="tel"
                    />
                  </label>
                  <label className="field">
                    <span>Travellers</span>
                    <select value={form.travellers} onChange={set('travellers')}>
                      {['1', '2', '3', '4', '5', '6+'].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="field-row">
                  <label className="field">
                    <span>Where to?</span>
                    <select value={form.destination} onChange={set('destination')}>
                      {WHERE.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                      {DESTINATIONS.map((d) => (
                        <option key={d.id} value={d.location}>
                          {d.location}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>When?</span>
                    <select value={form.when} onChange={set('when')}>
                      {MONTHS.map((m) => (
                        <option key={m} value={`${m} 2026`}>
                          {m} 2026
                        </option>
                      ))}
                      <option value="Flexible">I’m flexible</option>
                    </select>
                  </label>
                </div>

                <label className="field">
                  <span>Anything we should know?</span>
                  <textarea
                    value={form.notes}
                    onChange={set('notes')}
                    rows={3}
                    placeholder="Anniversary trip, prefer trains over flights, want a night in the desert…"
                  />
                </label>

                {error && (
                  <p className="field-error" role="alert">
                    {error}
                  </p>
                )}

                <Magnetic strength={0.14} className="plan-submit-wrap">
                  <button
                    type="submit"
                    className="btn btn--primary plan-submit"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send my enquiry'}
                    <Arrow />
                  </button>
                </Magnetic>

                <p className="plan-fine">
                  This is a demo form — nothing is stored or sent. Privacy first, always.
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
