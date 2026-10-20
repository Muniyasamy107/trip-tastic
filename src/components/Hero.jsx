import { useRef } from 'react'
import { gsap, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { RotatingSeal } from './ui'
import { heroImg, destinations } from '../data'

const featured = destinations[0]

export default function Hero({ ready }) {
  const root = useRef(null)
  const media = useRef(null)
  const img = useRef(null)

  // scroll parallax + pointer drift
  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.to(media.current, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(img.current, {
        scale: 1.18,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__content, .hero__deck', {
        y: -50,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: true },
      })

      if (!window.matchMedia('(hover: none)').matches) {
        const xTo = gsap.quickTo(media.current, 'x', { duration: 1.4, ease: 'power3.out' })
        const yTo = gsap.quickTo(img.current, 'y', { duration: 1.6, ease: 'power3.out' })
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
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero__frame', { opacity: 0, duration: 1.4 }, 0)
        .from('.hero__rail', { opacity: 0, duration: 1.2, stagger: 0.1 }, 0.1)
        .from('.hero__kicker > *', { y: 16, opacity: 0, duration: 0.9, stagger: 0.07 }, 0.15)
        .from('.hero__title .line > span', { yPercent: 116, rotate: 2, duration: 1.5, stagger: 0.12 }, 0.2)
        .from('.hero__lower', { opacity: 0, y: 30, duration: 1.1 }, 0.75)
        .from('.hero__actions .btn', { opacity: 0, y: 18, duration: 0.9, stagger: 0.08 }, 0.9)
        .from('.hero__seal', { scale: 0.7, opacity: 0, duration: 1.2 }, 1)
        .from('.hero__deck > *', { opacity: 0, y: 16, duration: 0.9, stagger: 0.08 }, 1)
    }, root)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__bg" ref={media}>
        <img
          ref={img}
          src={heroImg}
          alt="A winding road through emerald mountains and a waterfall at sunset"
          fetchPriority="high"
        />
      </div>
      <div className="hero__veil" />
      <div className="hero__glow" />

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

        <div className="hero__lower">
          <p className="hero__lede">
            Handcrafted holidays across India and beyond — <b>boutique stays</b>, private guides and slow,
            cinematic itineraries built around the way you actually like to travel.
          </p>
          <div className="hero__actions">
            <button type="button" className="btn" onClick={() => scrollToId('#enquiry')}>
              Plan my journey
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => scrollToId('#destinations')}>
              Explore destinations
            </button>
          </div>
          <div className="hero__seal">
            <RotatingSeal size={132} text="TRIP TASTIC HOLIDAYS · CRAFTED JOURNEYS · SINCE 2014 · " />
          </div>
        </div>
      </div>

      <div className="hero__deck shell">
        <div className="hero__facts">
          <span className="hero__fact">
            <span>01</span>
            <b>68</b>
            <i>Destinations, handpicked</i>
          </span>
          <span className="hero__fact">
            <span>02</span>
            <b>12</b>
            <i>Years crafting journeys</i>
          </span>
          <span className="hero__fact">
            <span>03</span>
            <b>4.9</b>
            <i>Average trip rating</i>
          </span>
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
