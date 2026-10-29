import { useRef, useState } from 'react'
import { gsap, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect, motionAllowed, pointerMotionAllowed } from '../lib/hooks'
import { Magnetic, RotatingSeal, BtnIcon, SEAL_TEXT } from './ui'
import HeroVideo from './HeroVideo'
import {
  heroImg,
  trip,
  featuredTrip as featured,
  destinationsCount,
  yearsRunning,
  rating,
} from '../data'

const facts = [
  ['01', destinationsCount, 'Destinations, handpicked'],
  ['02', yearsRunning, 'Years crafting journeys'],
  ['03', rating, 'Average trip rating'],
]

const shots = [
  { src: heroImg, label: 'The western ghats, at dusk' },
  { src: trip('ladakh').image, label: 'Pangong Tso, Ladakh' },
  { src: trip('bali').image, label: 'Rice terraces, Ubud' },
  { src: trip('kerala').image, label: 'Backwaters, Alleppey' },
]

export default function Hero({ ready }) {
  const root = useRef(null)
  const media = useRef(null)
  const [shot, setShot] = useState(0)
  const [filmOn, setFilmOn] = useState(false)

  // scroll parallax + pointer drift
  useIsoLayoutEffect(() => {
    if (!motionAllowed()) return
    const ctx = gsap.context(() => {
      gsap.to(media.current, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__slides', {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__content, .hero__deck', {
        y: -50,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: true },
      })

      if (pointerMotionAllowed()) {
        const xTo = gsap.quickTo(media.current, 'x', { duration: 1.4, ease: 'power3.out' })
        const yTo = gsap.quickTo('.hero__slides', 'y', { duration: 1.6, ease: 'power3.out' })
        const onMove = (e) => {
          const rx = e.clientX / window.innerWidth - 0.5
          const ry = e.clientY / window.innerHeight - 0.5
          xTo(rx * -22)
          yTo(ry * -18)
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        return () => window.removeEventListener('pointermove', onMove)
      }
    }, root)
    return () => ctx.revert()
  }, [])

  // entrance, fired when the curtain lifts
  useIsoLayoutEffect(() => {
    if (!ready || !motionAllowed()) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero__frame', { opacity: 0, duration: 1.4 }, 0)
        .from('.hero__rail', { opacity: 0, duration: 1.2, stagger: 0.1 }, 0.1)
        .from('.hero__kicker > *', { y: 16, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.15)
        .from('.hero__title .line > span', { yPercent: 116, rotate: 2, duration: 1.5, stagger: 0.12 }, 0.2)
        .from('.hero__caption', { opacity: 0, y: 14, duration: 0.9 }, 0.6)
        .from('.hero__lower', { opacity: 0, y: 30, duration: 1.1 }, 0.75)
        .from('.hero__actions .btn', { opacity: 0, y: 18, duration: 0.9, stagger: 0.08 }, 0.9)
        .from('.hero__seal', { scale: 0.7, opacity: 0, duration: 1.2 }, 1)
        .from('.hero__deck > *', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, 1)
    }, root)

    return () => ctx.revert()
  }, [ready])

  // cinematic shot sequence — slow crossfades with a settle zoom
  useIsoLayoutEffect(() => {
    const host = media.current
    if (!host) return
    if (filmOn) return
    const els = Array.from(host.querySelectorAll('.hero__slide'))
    if (!els.length) return
    if (!motionAllowed()) return

    gsap.set(els, { opacity: 0, scale: 1.12 })
    gsap.set(els[0], { opacity: 1, scale: 1.04 })

    let idx = 0
    const go = () => {
      const cur = els[idx]
      idx = (idx + 1) % els.length
      const next = els[idx]
      gsap.to(cur, { opacity: 0, duration: 1.7, ease: 'power2.inOut' })
      gsap.fromTo(
        next,
        { opacity: 0, scale: 1.12 },
        { opacity: 1, scale: 1.03, duration: 2, ease: 'power2.inOut' },
      )
      setShot(idx)
    }

    const id = window.setInterval(go, 6800)
    return () => {
      window.clearInterval(id)
      gsap.killTweensOf(els)
    }
  }, [filmOn])

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__bg" ref={media}>
        <div className="hero__slides">
          {shots.map((item, i) => (
            <div className={`hero__slide ${i === 0 ? 'is-active' : ''}`} key={item.src}>
              <img
                src={item.src}
                alt={i === 0 ? 'A winding road through emerald mountains and a waterfall at sunset' : ''}
                fetchPriority={i === 0 ? 'high' : 'low'}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>
      </div>
      <HeroVideo onReady={() => setFilmOn(true)} />
      <div className="hero__veil" />
      <div className="hero__glow" />
      <span className="hero__sweep" aria-hidden="true" />

      <div className="hero__frame" aria-hidden="true">
        <span className="bracket bracket--tl" />
        <span className="bracket bracket--tr" />
        <span className="bracket bracket--bl" />
        <span className="bracket bracket--br" />
      </div>

      <div className="hero__rail hero__rail--left" aria-hidden="true">
        <span>Est. 2014</span>
        <i />
        <span>Chennai · India</span>
      </div>
      <div className="hero__rail hero__rail--right" aria-hidden="true">
        <span>Scroll</span>
        <i />
        <span className="hero__shotcount">
          0{shot + 1} / 0{shots.length}
        </span>
      </div>

      <div className="hero__content shell">
        <p className="hero__kicker">
          <span className="hero__kicker-rule" />
          <span>Private journeys</span>
          <b>·</b>
          <span>India &amp; beyond</span>
          <span className="hero__kicker-rating">
            <b>4.9</b> ★ <span>4,800 travellers</span>
          </span>
        </p>

        <h1 className="hero__title">
          <span className="line">
            <span>The art of</span>
          </span>
          <span className="line">
            <span>
              <em className="gold-text">wandering</em> <span className="hero__outline">well</span>
            </span>
          </span>
        </h1>

        <p className="hero__caption" aria-hidden="true" key={shot}>
          <span className="hero__caption-line" />
          {filmOn ? shots[0].label : shots[shot].label}
        </p>

        <div className="hero__lower">
          <p className="hero__lede">
            Handcrafted holidays across India and beyond — <b>boutique stays</b>, private guides and slow,
            cinematic itineraries built around the way you actually like to travel.
          </p>
          <div className="hero__actions">
            <Magnetic strength={0.22}>
              <button type="button" className="btn" onClick={() => scrollToId('#enquiry')}>
                Plan my journey
                <BtnIcon />
              </button>
            </Magnetic>
            <button type="button" className="btn btn--ghost" onClick={() => scrollToId('#destinations')}>
              Explore destinations
            </button>
          </div>
          <div className="hero__seal">
            <RotatingSeal size={132} text={SEAL_TEXT.house} />
          </div>
        </div>
      </div>

      <div className="hero__deck shell">
        <div className="hero__facts">
          {facts.map(([num, value, label]) => (
            <span className="hero__fact" key={num}>
              <span>{num}</span>
              <b>{value}</b>
              <i>{label}</i>
            </span>
          ))}
        </div>

        <button type="button" className="hero__feature" onClick={() => scrollToId('#enquiry')}>
          <img src={featured.image} alt="" />
          <span className="hero__feature-text">
            <small>This week’s favourite</small>
            <b>{featured.name} backwaters</b>
            <i>
              {featured.days} days · from {featured.price}
            </i>
          </span>
          <span className="hero__feature-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      </div>
    </section>
  )
}
