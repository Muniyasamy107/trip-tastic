import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CRAFT } from '../data/content'
import { EASE, viewport } from '../lib/motion'
import { Eyebrow, SplitLines } from './ui/Reveal'

gsap.registerPlugin(ScrollTrigger)

export default function Craft() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      gsap.fromTo(
        '.craft-rail-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.craft-list',
            start: 'top 70%',
            end: 'bottom 75%',
            scrub: 0.4,
          },
        }
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section className="craft" id="craft" ref={root}>
      <div className="shell craft-shell">
        <aside className="craft-aside">
          <Eyebrow>02 — How we build it</Eyebrow>
          <SplitLines
            as="h2"
            className="section-title section-title--sm"
            lines={['The craft behind', 'the itinerary.']}
          />
          <p className="craft-lede">
            Anyone can book a hotel. The difference is in what happens between
            check-ins — the timing, the people, and the deliberate gaps.
          </p>

          <div className="craft-sign">
            <img src="/images/logo.jpeg" alt="" />
            <div>
              <strong>Muniyasamy R.</strong>
              <span>Founder &amp; lead route scout</span>
            </div>
          </div>
        </aside>

        <div className="craft-list">
          <span className="craft-rail" aria-hidden="true">
            <span className="craft-rail-fill" />
          </span>

          {CRAFT.map((item, i) => (
            <motion.article
              className="craft-item"
              key={item.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.85, ease: EASE, delay: i * 0.05 }}
            >
              <span className="craft-number">{item.number}</span>
              <div className="craft-body">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
              <span className="craft-plus" aria-hidden="true">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </span>
            </motion.article>
          ))}

          <motion.div
            className="craft-note"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span aria-hidden="true">✦</span>
            <p>
              Every booking plants ten saplings with a partner nursery in the Nilgiris —
              and funds one scholarship seat on the next local guide training cohort.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
