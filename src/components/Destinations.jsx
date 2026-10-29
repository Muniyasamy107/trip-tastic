import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { useIsoLayoutEffect, QUERY } from '../lib/hooks'
import { SectionHead, Tilt, BtnIcon } from './ui'
import { destinations, sectionIndex, otherTrip } from '../data'
import { chooseDestination } from '../lib/trip'

export default function Destinations() {
  const section = useRef(null)
  const track = useRef(null)

  useIsoLayoutEffect(() => {
    const mm = gsap.matchMedia()

    mm.add(QUERY.finePointer, () => {
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
        <SectionHead
          index={sectionIndex('destinations')}
          label="Where we wander"
          title="Places we *love*"
          aside={
            <>
              Eight starting points, endless versions. Every itinerary gets rebuilt around your dates, your
              budget and your people.
              <span className="dest__hint">
                Scroll to travel
                <svg viewBox="0 0 34 10" aria-hidden="true">
                  <path d="M0 5h30M26 1l4 4-4 4" />
                </svg>
              </span>
            </>
          }
        />
      </div>

      <div className="dest__viewport">
        <div className="dest__track" ref={track}>
          {destinations.map((d, i) => (
            <article className="dest-card" key={d.id}>
              <Tilt
                as="a"
                max={6}
                className="dest-card__media"
                data-cursor="plan"
                href="#enquiry"
                onClick={(e) => {
                  e.preventDefault()
                  chooseDestination(d.name)
                }}
                aria-label={`Plan a ${d.days}-day trip to ${d.name}, from ${d.price}`}
              >
                <img src={d.image} alt={`${d.name} — ${d.region}`} loading="lazy" />
                <span className="dest-card__tag">{d.tag}</span>
                <span className="dest-card__hover">
                  Plan this trip <span aria-hidden="true">↗</span>
                </span>
                <span className="dest-card__num">{String(i + 1).padStart(2, '0')}</span>
              </Tilt>
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
            <button type="button" className="btn btn--sm" onClick={() => chooseDestination(otherTrip)}>
              Ask a human
              <BtnIcon />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
