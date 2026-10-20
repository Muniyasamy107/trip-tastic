import { useRef } from 'react'
import { gsap, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { RotatingSeal } from './ui'
import ladakh from '../assets/ladakh.webp'

export default function Spotlight() {
  const section = useRef(null)
  const frame = useRef(null)
  const img = useRef(null)
  const content = useRef(null)

  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
        },
      })
      tl.fromTo(frame.current, { scale: 0.92, borderRadius: 44 }, { scale: 1, borderRadius: 0, ease: 'none', duration: 1 }, 0)
        .fromTo(img.current, { scale: 1.24 }, { scale: 1.02, ease: 'none', duration: 1 }, 0)
        .fromTo(content.current, { y: 90, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.6 }, 0.02)
        .to('.spotlight__stamp', { rotate: 40, ease: 'none', duration: 1 }, 0)
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section className="spotlight" id="spotlight" ref={section}>
      <div className="spotlight__sticky">
        <div className="spotlight__frame" ref={frame}>
          <img src={ladakh} alt="The winding road to Pangong lake in Ladakh" loading="lazy" ref={img} />
          <div className="spotlight__scrim" />
        </div>

        <div className="spotlight__stamp">
          <RotatingSeal size={150} text="TRIP TASTIC · JOURNEY OF THE MONTH · LADAKH · HIMALAYA · " />
        </div>

        <div className="spotlight__content" ref={content}>
          <span className="eyebrow">Journey of the month</span>
          <h2>
            The high passes of <em>Ladakh</em>
          </h2>
          <p>
            Seven days above the clouds: Pangong at sunrise, Nubra’s cold desert, monastery mornings and
            roads that feel like they were drawn for a film. Small group, big silence.
          </p>
          <div className="spotlight__facts">
            <span className="spotlight__fact">
              <b>7 days</b>
              <span>Leh → Nubra → Pangong</span>
            </span>
            <span className="spotlight__fact">
              <b>₹32,500</b>
              <span>Per traveller</span>
            </span>
            <span className="spotlight__fact">
              <b>8 max</b>
              <span>Small group</span>
            </span>
          </div>
          <div className="spotlight__actions">
            <button type="button" className="btn" onClick={() => scrollToId('#enquiry')}>
              Plan this journey
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </button>
            <a className="btn btn--ghost" href="#postcards">
              See the postcards
            </a>
          </div>
        </div>

        <span className="spotlight__index" aria-hidden="true">
          05 — The feature · Himalaya series
        </span>
      </div>
    </section>
  )
}
