import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { SectionHead, Reveal, BtnIcon } from './ui'
import { IconChat, IconPhone, IconMail, IconPin, IconShield } from './icons'
import { contact, destinationOptions, sectionIndex } from '../data'
import { onDestination } from '../lib/trip'

const months = [
  'Flexible',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const initial = {
  name: '',
  email: '',
  phone: '',
  destination: '',
  month: '',
  travellers: '2',
  notes: '',
}

export default function Enquiry() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState('idle')
  const success = useRef(null)

  useEffect(
    () =>
      onDestination((e) => {
        setStatus('idle')
        setForm((f) => ({ ...f, destination: e.detail }))
      }),
    [],
  )

  useEffect(() => {
    if (status !== 'sent' || !success.current) return
    const ctx = gsap.context(() => {
      gsap.from('.form__success-icon', { scale: 0.4, opacity: 0, duration: 0.7, ease: 'back.out(2.4)' })
      gsap.from('.form__success > *:not(.form__success-icon)', {
        y: 18,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'expo.out',
        delay: 0.15,
      })
      gsap.fromTo('.form__check', { strokeDashoffset: 40 }, { strokeDashoffset: 0, duration: 0.7, delay: 0.25, ease: 'power2.out' })
    }, success)
    return () => ctx.revert()
  }, [status])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const onSubmit = (e) => {
    e.preventDefault()
    setStatus('sending')
    window.setTimeout(() => setStatus('sent'), 900)
  }

  return (
    <section className="section section--cream enquiry" id="enquiry">
      <div className="shell">
        <SectionHead
          index={sectionIndex('enquiry')}
          label="Start here"
          title="Let’s write your *next chapter*."
        />
      </div>

      <div className="shell enquiry__grid">
        <div className="enquiry__copy">
          <Reveal>
            <p>
              Tell us roughly what you’re dreaming of. A real Trip Tastic planner — not a bot — replies within
              one working day with ideas, honest pricing and a first sketch of the route.
            </p>
          </Reveal>

          <div className="enquiry__channels">
            <a className="channel" href={contact.whatsapp} target="_blank" rel="noreferrer">
              <span className="channel__icon" aria-hidden="true">
                <IconChat />
              </span>
              <span>
                <b>WhatsApp us</b>
                <span>Fastest reply · usually under 20 minutes</span>
              </span>
            </a>
            <a className="channel" href={contact.phoneHref}>
              <span className="channel__icon" aria-hidden="true">
                <IconPhone />
              </span>
              <span>
                <b>{contact.phone}</b>
                <span>Mon–Sat · 9am to 8pm IST</span>
              </span>
            </a>
            <a className="channel" href={`mailto:${contact.email}`}>
              <span className="channel__icon" aria-hidden="true">
                <IconMail />
              </span>
              <span>
                <b>{contact.email}</b>
                <span>For detailed itineraries and invoices</span>
              </span>
            </a>
            <div className="channel">
              <span className="channel__icon" aria-hidden="true">
                <IconPin />
              </span>
              <span>
                <b>Our studio</b>
                <span>{contact.address}</span>
              </span>
            </div>
          </div>

          <p className="enquiry__note">
            <IconShield />
            No spam, no late-night sales calls, no sharing your number. Ever. Your details stay with the
            planner building your trip.
          </p>
        </div>

        <div className="form-card">
          <div className="form-card__head">
            <h3>Plan my journey</h3>
            <span>Takes ~60 seconds</span>
          </div>

          <form onSubmit={onSubmit} inert={status === 'sent'}>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="f-name">Your name</label>
                <input id="f-name" name="name" required placeholder="Divya Raman" value={form.name} onChange={update('name')} autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="f-email">Email</label>
                <input id="f-email" name="email" type="email" required placeholder="you@email.com" value={form.email} onChange={update('email')} autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="f-phone">Phone / WhatsApp</label>
                <input id="f-phone" name="phone" type="tel" required placeholder="+91 90000 00000" value={form.phone} onChange={update('phone')} autoComplete="tel" />
              </div>
              <div className="field">
                <label htmlFor="f-destination">Where to?</label>
                <select id="f-destination" name="destination" required value={form.destination} onChange={update('destination')}>
                  <option value="" disabled>
                    Pick a destination
                  </option>
                  {destinationOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-month">When</label>
                <select id="f-month" name="month" value={form.month} onChange={update('month')}>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-travellers">Travellers</label>
                <select id="f-travellers" name="travellers" value={form.travellers} onChange={update('travellers')}>
                  {['1', '2', '3–4', '5–8', '9+'].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === '1' ? 'traveller' : 'travellers'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field field--full">
                <label htmlFor="f-notes">Anything we should know?</label>
                <textarea
                  id="f-notes"
                  name="notes"
                  placeholder="Honeymoon, first time in the mountains, vegetarian food, budget around ₹25k per person…"
                  value={form.notes}
                  onChange={update('notes')}
                />
              </div>
            </div>

            <div className="form__foot">
              <button type="submit" className="btn btn--ink form__submit" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send my trip brief'}
                <BtnIcon />
              </button>
              <p className="form__fine">A planner replies within 1 working day. No payment needed to start.</p>
            </div>
          </form>

          {status === 'sent' && (
            <div className="form__success" ref={success} aria-live="polite">
              <span className="form__success-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path className="form__check" d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="40" />
                </svg>
              </span>
              <h3>That’s on its way, {form.name.split(' ')[0] || 'traveller'}.</h3>
              <p>
                We’ve got your brief for {form.destination || 'your trip'}. Expect a real reply from a Trip
                Tastic planner within one working day.
              </p>
              <a className="btn btn--sm" href={contact.whatsapp} target="_blank" rel="noreferrer">
                Ping us on WhatsApp
              </a>
              <small>Can’t wait? Call {contact.phone}.</small>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
