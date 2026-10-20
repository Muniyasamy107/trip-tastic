import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { SplitHeading, Reveal, Parallax, RotatingSeal, FrameReveal } from './ui'
import { stats } from '../data'
import ooty from '../assets/ooty.webp'
import kerala from '../assets/kerala.webp'

const icons = {
  compass: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z" />
    </svg>
  ),
  bed: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6" />
      <path d="M3 18h18M6 10V7a1 1 0 011-1h4a1 1 0 011 1v3M12 10V8a1 1 0 011-1h4a1 1 0 011 1v2" />
      <path d="M3 18v2M21 18v2" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.5 9.5 0 01-3.2-.5L3 21l1.6-4.6A8.4 8.4 0 1121 11.5z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
    </svg>
  ),
}

function Counter({ value, decimals = 0 }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      return
    }
    const obj = { v: 0 }
    el.textContent = (0).toFixed(decimals)
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: value,
          duration: 2.1,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = obj.v.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          },
        })
      },
    })
    return () => st.kill()
  }, [value, decimals])

  return <span ref={ref}>0</span>
}

export default function Story() {
  return (
    <section className="section section--cream story" id="story">
      <div className="shell">
        <div className="story__grid">
          <div className="story__visual">
            <Parallax speed={7}>
              <FrameReveal className="story__main frame">
                <img src={ooty} alt="Misty tea plantations in the Nilgiri hills near Ooty" loading="lazy" />
              </FrameReveal>
            </Parallax>

            <Parallax speed={-11} className="story__small">
              <div className="frame" style={{ height: '100%' }}>
                <img src={kerala} alt="A houseboat drifting through the Kerala backwaters" loading="lazy" />
              </div>
            </Parallax>

            <div className="story__badge">
              <RotatingSeal size={132} text="TRIP TASTIC HOLIDAYS · CRAFTED JOURNEYS · SINCE 2014 · " />
            </div>

            <div className="story__note">
              <b>98%</b>
              <span>travellers travel with us again</span>
            </div>
          </div>

          <div className="story__copy">
            <span className="eyebrow eyebrow--ink">Why Trip Tastic</span>
            <SplitHeading
              as="h2"
              text="We don’t sell trips. We design *memories*."
              className="story__title"
            />
            <Reveal>
              <p className="lede">
                Trip Tastic began in a Chennai living room with one borrowed jeep and a stubborn belief:
                a holiday should feel like it was made for you — <b>because it was.</b> Twelve years and
                four thousand travellers later, that’s still the whole plan.
              </p>
            </Reveal>

            <div className="story__features">
              <Reveal className="feature" delay={0.05}>
                <span className="feature__icon">{icons.compass}</span>
                <div>
                  <h3>Local eyes, everywhere</h3>
                  <p>Our guides grew up on these roads. They know which tea stall opens at sunrise and which viewpoint the buses miss.</p>
                </div>
              </Reveal>
              <Reveal className="feature" delay={0.1}>
                <span className="feature__icon">{icons.bed}</span>
                <div>
                  <h3>Boutique over big-box</h3>
                  <p>Heritage havelis, houseboats and hillside cabins — every stay is visited, photographed and hand-picked before it makes your itinerary.</p>
                </div>
              </Reveal>
              <Reveal className="feature" delay={0.15}>
                <span className="feature__icon">{icons.chat}</span>
                <div>
                  <h3>One WhatsApp thread</h3>
                  <p>From the first idea to the last airport drop, one team, one chat, and a human who answers at 2am if your flight lands late.</p>
                </div>
              </Reveal>
            </div>

            <div className="story__sign">
              <a className="btn btn--ink" href="#way">
                See how we travel
                <span className="btn__icon" aria-hidden="true">
                  ↓
                </span>
              </a>
              <span className="signature">
                <b>The Trip Tastic team</b>
                <span>Founder-led · Since 2014</span>
              </span>
            </div>
          </div>
        </div>

        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat__value">
                <Counter value={s.value} decimals={s.decimals || 0} />
                <i>{s.suffix}</i>
              </span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
