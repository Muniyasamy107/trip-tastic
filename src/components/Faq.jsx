import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FAQS } from '../data/content'
import { EASE } from '../lib/motion'
import { Arrow, Eyebrow, Reveal, SplitLines } from './ui/Reveal'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="faq" id="faq">
      <div className="shell faq-shell">
        <aside className="faq-aside">
          <Eyebrow>04 — Before you book</Eyebrow>
          <SplitLines
            as="h2"
            className="section-title section-title--sm"
            lines={['Good questions.', 'Straight answers.']}
          />
          <Reveal delay={0.1}>
            <p className="faq-lede">
              Still unsure? Send us a message — a real human replies, usually within a
              working day.
            </p>
            <a className="faq-card" href="mailto:hello@triptastic.in">
              <span>
                <em>Write to us</em>
                hello@triptastic.in
              </span>
              <Arrow />
            </a>
            <a className="faq-card" href="tel:+919876543210">
              <span>
                <em>Call the studio</em>
                +91 98765 43210
              </span>
              <Arrow />
            </a>
          </Reveal>
        </aside>

        <div className="faq-list">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <div className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-trigger"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span className="faq-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-q">{item.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <span />
                      <span />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="panel"
                        id={`faq-panel-${i}`}
                        role="region"
                        aria-labelledby={`faq-trigger-${i}`}
                        className="faq-panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
