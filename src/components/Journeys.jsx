import { useState } from 'react'
import { motion } from 'framer-motion'
import { DESTINATIONS } from '../data/content'
import { EASE, viewport } from '../lib/motion'
import { Arrow, Eyebrow, Reveal, SplitLines } from './ui/Reveal'
import JourneyModal from './JourneyModal'

function JourneyCard({ journey, tall = false, delay = 0, onOpen }) {
  return (
    <motion.article
      className={`journey-card ${tall ? 'is-tall' : ''}`}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.95, ease: EASE, delay }}
    >
      <button
        type="button"
        className="journey-btn"
        onClick={() => onOpen(journey)}
        aria-label={`Open details for ${journey.title}, ${journey.location}`}
      >
        <div className="journey-media">
          <img src={journey.image} alt={journey.location} loading="lazy" />
          <span className="journey-shade" aria-hidden="true" />
        </div>

        <div className="journey-top">
          <span className="journey-num">{journey.index}</span>
          <span className="journey-chip">{journey.season}</span>
        </div>

        <div className="journey-bottom">
          <p className="journey-loc">{journey.location}</p>
          <h3 className="journey-title">{journey.title}</h3>

          <div className="journey-meta">
            <span>{journey.nights}</span>
            <span className="journey-dot" aria-hidden="true" />
            <span>from {journey.price}</span>
            <span className="journey-cta">
              View journey
              <Arrow size={14} />
            </span>
          </div>
        </div>

        <span className="journey-frame" aria-hidden="true" />
      </button>
    </motion.article>
  )
}

export default function Journeys() {
  const [active, setActive] = useState(null)
  const [a, b, c, d, e] = DESTINATIONS

  return (
    <section className="journeys" id="journeys">
      <div className="shell">
        <div className="section-head">
          <div>
            <Eyebrow>01 — The collection</Eyebrow>
            <SplitLines
              as="h2"
              className="section-title"
              lines={['Five ways to', 'disappear for a week.']}
            />
          </div>
          <Reveal className="section-aside" delay={0.15}>
            <p>
              Each departure is a small edition: ten seats, one route, and a trip lead
              who has walked it before. Pick a mood — we’ll handle the rest.
            </p>
            <a href="#plan" className="link-arrow">
              Not sure yet? Talk to a planner
              <Arrow size={14} />
            </a>
          </Reveal>
        </div>

        <div className="journey-mosaic">
          <div className="journey-row journey-row--a">
            <JourneyCard journey={a} tall onOpen={setActive} />
            <div className="journey-stack">
              <JourneyCard journey={b} onOpen={setActive} delay={0.08} />
              <JourneyCard journey={c} onOpen={setActive} delay={0.14} />
            </div>
          </div>

          <div className="journey-row journey-row--b">
            <JourneyCard journey={d} onOpen={setActive} />
            <JourneyCard journey={e} onOpen={setActive} delay={0.08} />
          </div>
        </div>

        <Reveal className="journey-foot" delay={0.08}>
          <p>
            <span>38 routes mapped.</span> These five are just the ones we can’t stop
            talking about this season.
          </p>
          <a href="#plan" className="link-arrow">
            Request the full atlas
            <Arrow size={14} />
          </a>
        </Reveal>
      </div>

      <JourneyModal journey={active} onClose={() => setActive(null)} />
    </section>
  )
}
