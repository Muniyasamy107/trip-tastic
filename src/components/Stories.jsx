import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DESTINATIONS, TESTIMONIALS } from '../data/content'
import { EASE } from '../lib/motion'
import { Arrow, Eyebrow, SplitLines } from './ui/Reveal'

const IMAGES = [
  DESTINATIONS[1].image,
  DESTINATIONS[3].image,
  DESTINATIONS[0].image,
]

export default function Stories() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = TESTIMONIALS.length
  const active = TESTIMONIALS[index]

  useEffect(() => {
    if (paused) return undefined
    const t = window.setTimeout(() => setIndex((v) => (v + 1) % total), 8200)
    return () => window.clearTimeout(t)
  }, [index, paused, total])

  const go = (dir) => setIndex((v) => (v + dir + total) % total)

  return (
    <section
      className="stories"
      id="stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="shell">
        <div className="section-head section-head--tight">
          <div>
            <Eyebrow>03 — Postcards home</Eyebrow>
            <SplitLines
              as="h2"
              className="section-title"
              lines={['They came back', 'with stories.']}
            />
          </div>
          <div className="stories-nav">
            <button type="button" onClick={() => go(-1)} aria-label="Previous story">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12 4L6 10l6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="stories-counter">
              {String(index + 1).padStart(2, '0')}
              <em>/ {String(total).padStart(2, '0')}</em>
            </span>
            <button type="button" onClick={() => go(1)} aria-label="Next story">
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="stories-panel">
          <div className="stories-copy">
            <span className="stories-quote-mark" aria-hidden="true">
              “
            </span>

            <div className="stories-quote-wrap">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active.name}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="stories-quote"
                >
                  {active.quote}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            <div className="stories-author">
              <span className="stories-avatar" style={{ background: ['#C97B3C', '#3F7A63', '#8A6A3B'][index] }}>
                {active.initials}
              </span>
              <div>
                <strong>{active.name}</strong>
                <span>{active.detail}</span>
              </div>
              <span className="stories-stars" aria-label="5 out of 5">
                ★★★★★
              </span>
            </div>

            <div className="stories-progress" aria-hidden="true">
              <motion.span
                key={`${index}-${paused}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: paused ? 0 : 1 }}
                transition={{ duration: paused ? 0.2 : 8.2, ease: 'linear' }}
              />
            </div>
          </div>

          <div className="stories-media">
            <AnimatePresence>
              <motion.img
                key={IMAGES[index]}
                src={IMAGES[index]}
                alt=""
                initial={{ opacity: 0, scale: 1.07 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: EASE }}
                loading="lazy"
              />
            </AnimatePresence>
            <span className="stories-media-tag">
              Field note
              <em>{String(index + 1).padStart(3, '0')}</em>
            </span>
          </div>
        </div>

        <div className="stories-foot">
          <span>As told to our trip leads, unedited.</span>
          <a href="#plan" className="link-arrow">
            Start your own story
            <Arrow size={14} />
          </a>
        </div>
      </div>
    </section>
  )
}
