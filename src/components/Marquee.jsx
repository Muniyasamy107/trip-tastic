import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect } from 'react'
import { MARQUEE_ITEMS } from '../data/content'

gsap.registerPlugin(ScrollTrigger)

export default function Marquee() {
  const root = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const ctx = gsap.context(() => {
      // Speed/direction reacts to scroll velocity — a small detail that
      // makes the strip feel physically attached to the page.
      const tl = gsap.to('.marquee-track', {
        xPercent: -50,
        repeat: -1,
        duration: 26,
        ease: 'none',
      })
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const v = gsap.utils.clamp(-6, 6, self.getVelocity() / -420)
          gsap.to(tl, {
            timeScale: gsap.utils.clamp(0.4, 4, 1 + Math.abs(v) * 0.55),
            duration: 0.4,
            overwrite: true,
          })
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]

  return (
    <div className="marquee" ref={root} aria-hidden="true">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span className="marquee-item" key={`${item}-${i}`}>
            {item}
            <svg viewBox="0 0 24 24" className="marquee-star" fill="none">
              <path
                d="M12 1v22M1 12h22M4.2 4.2l15.6 15.6M19.8 4.2L4.2 19.8"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  )
}
