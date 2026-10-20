import { useRef } from 'react'
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { SplitHeading, Reveal } from './ui'
import { destinations } from '../data'

function pick(name) {
  window.dispatchEvent(new CustomEvent('tt:destination', { detail: name }))
  scrollToId('#enquiry')
}

export default function Destinations() {
  const section = useRef(null)
  const viewport = useRef(null)
  const track = useRef(null)

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const el = section.current
      const tr = track.current
      el.classList.add('is-pinned')

      const distance = () => Math.max(0, tr.scrollWidth - window.innerWidth)

      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
      })

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        animation: tween,
        invalidateOnRefresh: true,
      })

      return () => {
        el.classList.remove('is-pinned')
        st.kill()
        tween.kill()
        gsap.set(tr, { clearProps: 'transform' })
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="dest" id="destinations" ref={section}>
      <div className="dest__head shell">
        <div>
          <span className="eyebrow">Where we wander</span>
          <SplitHeading as="h2" text="Places we *love*" />
        </div>
        <div className="dest__aside">
          <Reveal>
            <p>
              Eight starting points, endless versions. Every itinerary below gets rebuilt around your dates,
              your budget and your people.
            </p>
          </Reveal>
          <span className="dest__hint">
            Scroll to travel
            <svg viewBox="0 0 34 10" aria-hidden="true">
              <path d="M0 5h30M26 1l4 4-4 4" />
            </svg>
          </span>
        </div>
      </div>

      <div className="dest__viewport" ref={viewport}>
        <div className="dest__track" ref={track}>
          {destinations.map((d, i) => (
            <article className="dest-card" key={d.id}>
              <a
                className="dest-card__media"
                href="#enquiry"
                onClick={(e) => {
                  e.preventDefault()
                  pick(d.name)
                }}
                aria-label={`Plan a ${d.days}-day trip to ${d.name}, from ${d.price}`}
              >
                <img src={d.image} alt={`${d.name} — ${d.region}`} loading="lazy" />
                <span className="dest-card__tag">{d.tag}</span>
                <span className="dest-card__hover">
                  Plan this trip <span aria-hidden="true">↗</span>
                </span>
                <span className="dest-card__num">{String(i + 1).padStart(2, '0')}</span>
              </a>
              <div className="dest-card__body">
                <div className="dest-card__title">
                  <h3>{d.name}</h3>
                  <span>{d.region}</span>
                </div>
                <div className="dest-card__meta">
                  <span>{d.days} days · private</span>
                  <span>
                    from <b>{d.price}</b>
                  </span>
                </div>
                <span className="dest-card__accent" style={{ '--accent': d.accent }} />
              </div>
            </article>
          ))}

          <div className="dest__end">
            <span className="eyebrow eyebrow--plain">Can’t decide?</span>
            <h3>
              Tell us the feeling. <em className="h-em">We’ll find the place.</em>
            </h3>
            <p>Send three words — “quiet, green, coffee” — and we’ll come back with a route.</p>
            <button type="button" className="btn btn--sm" onClick={() => pick('Somewhere else entirely')}>
              Ask a human
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
