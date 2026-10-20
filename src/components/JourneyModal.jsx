import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { EASE } from '../lib/motion'
import { getLenis, scrollToId } from '../lib/smoothScroll'
import { Arrow } from './ui/Reveal'

export default function JourneyModal({ journey, onClose }) {
  const closeRef = useRef(null)
  const open = Boolean(journey)

  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.body.classList.add('modal-open')
      closeRef.current?.focus()
    } else {
      lenis?.start()
      document.body.classList.remove('modal-open')
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('modal-open')
    }
  }, [open, onClose])

  const discuss = () => {
    onClose?.()
    window.setTimeout(() => scrollToId('#plan'), 220)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${journey.title} journey details`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="modal-backdrop" onClick={onClose} />

          <motion.div
            className="modal-panel"
            initial={{ y: 60, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <button
              type="button"
              className="modal-close"
              onClick={onClose}
              ref={closeRef}
              aria-label="Close journey details"
            >
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            <motion.div
              className="modal-media"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <img src={journey.image} alt={journey.location} />
              <span className="modal-media-badge">{journey.season}</span>
            </motion.div>

            <div className="modal-body">
              <span className="modal-index">{journey.index} / The collection</span>
              <h3 className="modal-title">{journey.title}</h3>
              <p className="modal-location">{journey.location}</p>
              <p className="modal-blurb">{journey.blurb}</p>

              <dl className="modal-facts">
                <div>
                  <dt>Duration</dt>
                  <dd>{journey.nights}</dd>
                </div>
                <div>
                  <dt>Season</dt>
                  <dd>{journey.season}</dd>
                </div>
                <div>
                  <dt>From</dt>
                  <dd>{journey.price}</dd>
                </div>
                <div>
                  <dt>Group size</dt>
                  <dd>Max 10</dd>
                </div>
              </dl>

              <div className="modal-tags">
                {journey.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn--primary" onClick={discuss}>
                  Ask about this journey
                  <Arrow />
                </button>
                <button type="button" className="btn btn--ghost" onClick={onClose}>
                  Keep browsing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
