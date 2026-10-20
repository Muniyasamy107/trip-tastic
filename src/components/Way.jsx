import { useRef, useState } from 'react'
import { ScrollTrigger, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { SectionHead, RotatingSeal, FrameReveal } from './ui'
import { steps } from '../data'
import himachal from '../assets/himachal.webp'

export default function Way() {
  const [active, setActive] = useState(0)
  const list = useRef(null)

  useIsoLayoutEffect(() => {
    const nodes = gsapNodes(list.current)
    const triggers = nodes.map((el, i) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 62%',
        end: 'bottom 38%',
        onEnter: () => setActive(i),
        onEnterBack: () => setActive(i),
      }),
    )
    return () => triggers.forEach((t) => t.kill())
  }, [])

  return (
    <section className="section section--cream way" id="way">
      <div className="shell way__grid">
        <div className="way__sticky">
          <FrameReveal className="way__frame frame">
            <img src={himachal} alt="Snow-dusted pines and a mountain road in Himachal Pradesh" loading="lazy" />
          </FrameReveal>
          <div className="way__seal">
            <RotatingSeal size={126} text="TRIP TASTIC HOLIDAYS · HANDCRAFTED, NOT PACKAGED · " />
          </div>
          <div className="way__glass">
            <span className="way__glass-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.5 9.5 0 01-3.2-.5L3 21l1.6-4.6A8.4 8.4 0 1121 11.5z" />
              </svg>
            </span>
            <div>
              <b>24/7 on-trip support</b>
              <span>A real human on WhatsApp, always</span>
            </div>
          </div>
        </div>

        <div className="way__body">
          <SectionHead
            index="03"
            label="The Trip Tastic way"
            title="Less planning. *More* being there."
            aside="Four steps, one team, zero spreadsheets. This is how a Trip Tastic holiday gets made — and why it feels nothing like booking a package."
          />

          <div className="way__list" ref={list}>
            {steps.map((s, i) => (
              <div className={`way__step ${active === i ? 'is-active' : ''}`} key={s.title}>
                <span className="way__step-num">{s.kicker.replace('Step ', '')}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="way__cta">
            <button type="button" className="btn btn--ink" onClick={() => scrollToId('#enquiry')}>
              Start with a 15-min call
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </button>
            <span className="way__cta-note">No obligation, no 40-field form. Just a conversation.</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function gsapNodes(root) {
  if (!root) return []
  return Array.from(root.querySelectorAll('.way__step'))
}
