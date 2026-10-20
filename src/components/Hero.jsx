import { useRef } from 'react'
import { gsap } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { scrollToId } from '../lib/scroll'
import { RotatingSeal } from './ui'
import { heroImg, destinations } from '../data'

const postcard = destinations[0]

export default function Hero({ ready }) {
  const root = useRef(null)
  const media = useRef(null)
  const img = useRef(null)

  // scroll parallax
  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      gsap.to(media.current, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to(img.current, {
        scale: 1.2,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.to('.hero__inner', {
        y: -60,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '80% top', scrub: true },
      })

      // pointer drift
      if (!window.matchMedia('(hover: none)').matches) {
        const xTo = gsap.quickTo(media.current, 'x', { duration: 1.2, ease: 'power3.out' })
        const yTo = gsap.quickTo(img.current, 'y', { duration: 1.4, ease: 'power3.out' })
        const onMove = (e) => {
          const rx = e.clientX / window.innerWidth - 0.5
          const ry = e.clientY / window.innerHeight - 0.5
          xTo(rx * -26)
          yTo(ry * -22)
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        return () => window.removeEventListener('pointermove', onMove)
      }
    }, root)
    return () => ctx.revert()
  }, [])

  // entrance, fired when the preloader curtain starts to lift
  useIsoLayoutEffect(() => {
    if (!ready) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.hero__eyebrow > *', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08 })
        .from(
          '.hero__title .line > span',
          { yPercent: 118, rotate: 2, duration: 1.35, stagger: 0.11 },
          '-=0.65',
        )
        .from('.hero__sub p', { y: 26, opacity: 0, duration: 1 }, '-=0.85')
        .from('.hero__actions .magnetic, .hero__actions > .btn', { y: 22, opacity: 0, duration: 0.9, stagger: 0.08 }, '-=0.75')
        .from('.hero__postcard', { y: 40, opacity: 0, rotate: -10, duration: 1.3 }, '-=0.9')
        .from('.hero__seal, .hero__seal-mobile', { scale: 0.65, opacity: 0, duration: 1.1, stagger: 0.1 }, '-=1')
        .from('.hero__foot > *', { y: 16, opacity: 0, duration: 0.8, stagger: 0.09 }, '-=0.8')
    }, root)

    return () => ctx.revert()
  }, [ready])

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__media" ref={media}>
        <img ref={img} src={heroImg} alt="A winding road through green mountains and a waterfall at sunset" fetchPriority="high" />
      </div>
      <div className="hero__scrim" />
      <div className="hero__tint" />

      <div className="hero__inner shell">
        <div className="hero__eyebrow">
          <span className="hero__rating">
            <b>4.9</b>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ color: '#e9b44c' }}>
              <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z" />
            </svg>
            <span>4,800+ travellers</span>
          </span>
          <span className="dot" />
          <span>Handcrafted since 2014</span>
          <span className="dot" />
          <span>Chennai · India</span>
        </div>

        <h1 className="hero__title">
          <span className="line">
            <span>Wander further,</span>
          </span>
          <span className="line">
            <span>
              feel <em>more.</em>
            </span>
          </span>
        </h1>

        <div className="hero__sub">
          <p>
            Handcrafted holidays across India and beyond — <b>boutique stays</b>, private guides, and slow,
            cinematic itineraries built around the way you actually like to travel.
          </p>
          <div className="hero__actions">
            <a
              className="btn"
              href="#enquiry"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('#enquiry')
              }}
            >
              Plan my journey
              <span className="btn__icon" aria-hidden="true">
                ↗
              </span>
            </a>
            <a
              className="btn btn--ghost"
              href="#destinations"
              onClick={(e) => {
                e.preventDefault()
                scrollToId('#destinations')
              }}
            >
              Explore destinations
            </a>
          </div>
        </div>
      </div>

      <a
        className="hero__postcard"
        href="#destinations"
        onClick={(e) => {
          e.preventDefault()
          scrollToId('#destinations')
        }}
        aria-label={`Featured journey: ${postcard.name}, ${postcard.days} days from ${postcard.price}`}
      >
        <div className="hero__postcard-img">
          <img src={postcard.image} alt="" loading="eager" />
          <span className="hero__postcard-tag">This week’s favourite</span>
        </div>
        <div className="hero__postcard-body">
          <div>
            <small>Curated escape</small>
            <strong>{postcard.name} backwaters</strong>
            <em>
              {postcard.days} days · from {postcard.price}
            </em>
          </div>
          <span className="hero__postcard-arrow" aria-hidden="true">
            ↗
          </span>
        </div>
      </a>

      <div className="hero__seal">
        <RotatingSeal size={148} text="TRIP TASTIC HOLIDAYS · CRAFTED JOURNEYS · SINCE 2014 · " />
      </div>

      <div className="hero__foot shell">
        <span className="hero__scroll">
          <span className="hero__scroll-rail" aria-hidden="true" />
          Scroll to explore
        </span>

        <span className="hero__trust">
          <span className="hero__avatars" aria-hidden="true">
            <span>DA</span>
            <span>KR</span>
            <span>SP</span>
            <span>+</span>
          </span>
          <span className="hero__trust-text">
            <b>Loved by 4,800+ travellers</b>
            68 destinations · 12 years of stories
          </span>
        </span>

        <span className="hero__seal-mobile" aria-hidden="true">
          <RotatingSeal size={92} />
        </span>
      </div>
    </section>
  )
}
