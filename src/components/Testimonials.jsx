import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { SectionHead, Stars } from './ui'
import { testimonials } from '../data'

export default function Testimonials() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const stage = useRef(null)
  const t = testimonials[index]

  useEffect(() => {
    const id = setTimeout(() => {
      if (!paused) setIndex((i) => (i + 1) % testimonials.length)
    }, 7000)
    return () => clearTimeout(id)
  }, [index, paused])

  useEffect(() => {
    if (!stage.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.testi__quote', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' })
      gsap.fromTo('.testi__author', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', delay: 0.08 })
    }, stage)
    return () => ctx.revert()
  }, [index])

  const go = (dir) => setIndex((i) => (i + dir + testimonials.length) % testimonials.length)

  return (
    <section className="section testi" id="stories">
      <div className="shell">
        <SectionHead
          index="06"
          label="Stories, not stats"
          title="Loved by travellers, *not* algorithms."
        />
      </div>

      <div className="shell testi__grid">
        <div className="testi__intro">
          <p>
            Four thousand eight hundred people have trusted us with their leave days. Here’s what a few of
            them said when they got home.
          </p>
          <div className="testi__rating">
            <b>4.9</b>
            <span>
              <Stars />
              <br />
              1,200+ verified reviews
            </span>
          </div>
        </div>

        <div>
          <div
            className="testi__stage"
            ref={stage}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            aria-live="polite"
          >
            <div>
              <Stars />
              <p className="testi__quote" style={{ marginTop: '1rem' }}>
                {t.quote}
              </p>
            </div>
            <div className="testi__author">
              <span className="testi__avatar" aria-hidden="true">
                {t.initials}
              </span>
              <span>
                <b>{t.name}</b>
                <span>{t.meta}</span>
              </span>
            </div>
          </div>

          <div className="testi__controls">
            <div className="testi__dots" role="tablist" aria-label="Choose a review">
              {testimonials.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Review ${i + 1}: ${item.name}`}
                  className={`testi__dot ${i === index ? 'is-active' : ''}`}
                  onClick={() => setIndex(i)}
                />
              ))}
            </div>
            <div className="testi__arrows">
              <button type="button" className="testi__arrow" onClick={() => go(-1)} aria-label="Previous review">
                <svg viewBox="0 0 24 24">
                  <path d="M15 5l-7 7 7 7" />
                </svg>
              </button>
              <button type="button" className="testi__arrow" onClick={() => go(1)} aria-label="Next review">
                <svg viewBox="0 0 24 24">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
