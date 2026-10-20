import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { STATS } from '../data/content'
import { Eyebrow } from './ui/Reveal'

gsap.registerPlugin(ScrollTrigger)

function Counter({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent =
        new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value) + suffix
      return
    }

    const obj = { n: 0 }
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: value,
        duration: 2.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => {
          el.textContent =
            new Intl.NumberFormat('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            }).format(obj.n) + suffix
        },
      })
    })
    return () => ctx.revert()
  }, [value, suffix, decimals])

  return <span ref={ref}>0</span>
}

export default function Expedition() {
  const root = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const media = gsap.matchMedia()

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '.expedition-img',
          { scale: 1.32, yPercent: -4 },
          {
            scale: 1,
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.7,
            },
          }
        )

        gsap.fromTo(
          '.expedition-veil',
          { opacity: 0.85 },
          {
            opacity: 0.45,
            ease: 'none',
            scrollTrigger: {
              trigger: root.current,
              start: 'top bottom',
              end: 'center center',
              scrub: 0.6,
            },
          }
        )
      })

      return () => media.revert()
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="expedition" id="expedition" ref={root}>
      <div className="expedition-pin">
        <div className="expedition-media">
          <img
            className="expedition-img"
            src="/images/expedition-wide.jpg"
            alt="An off-road jeep parked above a waterfall valley at sunset"
            loading="lazy"
          />
          <span className="expedition-veil" aria-hidden="true" />
          <span className="expedition-grain" aria-hidden="true" />
        </div>

        <div className="shell expedition-content">
          <Eyebrow className="is-light">The expedition standard</Eyebrow>

          <h2 className="expedition-title">
            Built like a road trip.
            <br />
            <em>Run like clockwork.</em>
          </h2>

          <p className="expedition-lede">
            Twelve years of driving these roads means the boring parts are handled —
            permits, altitude days, backup vehicles, the guesthouse that actually has
            hot water. What’s left is the good stuff.
          </p>

          <div className="expedition-stats">
            {STATS.map((stat) => (
              <div className="stat" key={stat.label}>
                <p className="stat-value">
                  <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                </p>
                <p className="stat-label">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="expedition-marquee" aria-hidden="true">
            <span>4x4 fleet</span>
            <span>·</span>
            <span>Local trip leads</span>
            <span>·</span>
            <span>Maximum 10 travellers</span>
            <span>·</span>
            <span>24/7 on-ground support</span>
          </div>
        </div>

        <div className="expedition-coord" aria-hidden="true">
          34°09′N 77°34′E
          <span>Leh · Ladakh</span>
        </div>
      </div>
    </section>
  )
}
