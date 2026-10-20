import { Suspense, lazy, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { EASE, lineReveal } from '../lib/motion'
import { scrollToId } from '../lib/smoothScroll'
import Magnetic from './ui/Magnetic'
import { Arrow } from './ui/Reveal'

const GlobeScene = lazy(() => import('./globe/GlobeScene'))

const FLOATS = [
  {
    src: '/images/dest-ladakh.jpg',
    alt: 'A jeep on a high Himalayan pass in Ladakh',
    label: 'Ladakh',
    meta: '32.7° N · 77.5° E',
    cls: 'hero-float--a',
    depth: 1.15,
  },
  {
    src: '/images/dest-kerala.jpg',
    alt: 'A houseboat drifting through Kerala backwaters at sunset',
    label: 'Kerala',
    meta: '9.9° N · 76.2° E',
    cls: 'hero-float--b',
    depth: 0.7,
  },
]

export default function Hero({ ready }) {
  const root = useRef(null)

  /* GSAP: scroll-linked zoom on the globe + floating card drift */
  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.to('.hero-scene', {
          scale: 1.18,
          yPercent: 10,
          opacity: 0.25,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })

        gsap.to('.hero-copy', {
          yPercent: -12,
          opacity: 0.15,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })

        gsap.utils.toArray('.hero-float').forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -16 : 14,
            rotate: i % 2 === 0 ? -1.2 : 1.4,
            duration: 3.4 + i * 0.7,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: 0.4 + i * 0.35,
          })
        })
      })

      return () => media.revert()
    }, root)

    return () => ctx.revert()
  }, [])

  /* Pointer parallax on the photo cards */
  useEffect(() => {
    const el = root.current
    if (!el) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const cards = Array.from(el.querySelectorAll('.hero-float-inner'))
    const setters = cards.map((card) => ({
      x: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3.out' }),
      y: gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power3.out' }),
      depth: Number(card.dataset.depth || 1),
    }))

    const onMove = (e) => {
      const { innerWidth, innerHeight } = window
      const nx = (e.clientX / innerWidth - 0.5) * 2
      const ny = (e.clientY / innerHeight - 0.5) * 2
      setters.forEach((s) => {
        s.x(nx * 10 * s.depth)
        s.y(ny * 8 * s.depth)
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    scrollToId(href)
  }

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-bg" aria-hidden="true">
        <span className="hero-glow hero-glow--gold" />
        <span className="hero-glow hero-glow--jade" />
        <span className="hero-grid" />
      </div>

      <div className="shell hero-shell">
        <div className="hero-copy">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: 18 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: EASE, delay: 0.05 }}
          >
            <img src="/images/logo.jpeg" alt="" />
            <span>Small-group expeditions · Since 2014</span>
          </motion.div>

          <h1 className="hero-title">
            {['Wander wildly.', <>Return <em>different.</em></>].map((line, i) => (
              <span className="line-mask" key={i}>
                <motion.span
                  className="line-inner"
                  variants={lineReveal}
                  custom={i + 1}
                  initial="hidden"
                  animate={ready ? 'show' : 'hidden'}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="hero-lede"
            initial={{ opacity: 0, y: 22 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
          >
            Hand-built journeys across the Himalayas, backwaters, deserts and beyond.
            Ten travellers, local guides, and enough empty space in the plan for the
            detour you’ll actually remember.
          </motion.p>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, y: 22 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, ease: EASE, delay: 0.58 }}
          >
            <Magnetic strength={0.22}>
              <a href="#journeys" className="btn btn--primary" onClick={(e) => go(e, '#journeys')}>
                Explore journeys
                <Arrow />
              </a>
            </Magnetic>
            <Magnetic strength={0.18}>
              <a href="#plan" className="btn btn--ghost" onClick={(e) => go(e, '#plan')}>
                Plan my trip
                <span className="btn-dot" />
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            className="hero-proof"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ duration: 1, ease: EASE, delay: 0.75 }}
          >
            <div className="avatar-stack" aria-hidden="true">
              <span style={{ background: '#C97B3C' }}>AR</span>
              <span style={{ background: '#3F7A63' }}>KS</span>
              <span style={{ background: '#8A6A3B' }}>MJ</span>
              <span className="avatar-more">4.9</span>
            </div>
            <p>
              <strong>4.9 / 5</strong> from 1,200+ travellers
              <span className="hero-proof-sub">Zero copy-paste itineraries. Ever.</span>
            </p>
          </motion.div>
        </div>

        <div className="hero-scene">
          <div className="hero-globe">
            <Suspense fallback={<div className="globe-skeleton" aria-hidden="true" />}>
              {ready ? <GlobeScene /> : <div className="globe-skeleton" aria-hidden="true" />}
            </Suspense>
          </div>

          <span className="hero-orbit-label hero-orbit-label--top">Interactive atlas</span>
          <span className="hero-orbit-label hero-orbit-label--bottom">Drag your eyes, not your plans</span>

          {FLOATS.map((card) => (
            <figure className={`hero-float ${card.cls}`} key={card.src}>
              <div className="hero-float-inner" data-depth={card.depth}>
                <img src={card.src} alt={card.alt} loading="eager" />
                <figcaption>
                  <span>{card.label}</span>
                  <em>{card.meta}</em>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <motion.a
        href="#journeys"
        className="scroll-cue"
        onClick={(e) => go(e, '#journeys')}
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
        Scroll to wander
      </motion.a>
    </section>
  )
}
