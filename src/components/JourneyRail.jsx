import { useRef } from 'react'
import { gsap, ScrollTrigger, scrollToId } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'

const stops = [
  ['01', 'Destinations', '#destinations'],
  ['02', 'The House', '#story'],
  ['03', 'The Way', '#way'],
  ['04', 'Spotlight', '#spotlight'],
  ['05', 'Postcards', '#postcards'],
  ['06', 'Stories', '#stories'],
  ['07', 'Enquire', '#enquiry'],
]

export default function JourneyRail() {
  const root = useRef(null)
  const plane = useRef(null)
  const fill = useRef(null)

  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!plane.current || !fill.current) return

    const scrub = {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
    }

    const travel = gsap.to(plane.current, { top: '100%', ease: 'none', scrollTrigger: scrub })
    const line = gsap.fromTo(fill.current, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { ...scrub } })

    const marks = Array.from(root.current.querySelectorAll('[data-stop]'))
    const triggers = marks.map((mark) => {
      const target = document.querySelector(mark.dataset.stop)
      if (!target) return null
      return ScrollTrigger.create({
        trigger: target,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => mark.classList.toggle('is-current', self.isActive),
      })
    })

    return () => {
      travel.scrollTrigger?.kill()
      travel.kill()
      line.scrollTrigger?.kill()
      line.kill()
      triggers.forEach((t) => t?.kill())
    }
  }, [])

  return (
    <aside className="jrail" ref={root} aria-hidden="true">
      <span className="jrail__label">The journey</span>
      <div className="jrail__line">
        <span className="jrail__fill" ref={fill} />
        <span className="jrail__plane" ref={plane} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V4a1.5 1.5 0 0 0-3 0v5l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
          </svg>
        </span>
        {stops.map(([num, label, href]) => (
          <button
            type="button"
            key={href}
            className="jrail__stop"
            data-stop={href}
            onClick={() => scrollToId(href)}
            tabIndex={-1}
            aria-hidden="true"
          >
            <span className="jrail__dot" />
            <span className="jrail__tip">
              <i>{num}</i> {label}
            </span>
          </button>
        ))}
      </div>
      <span className="jrail__count">07 stops</span>
    </aside>
  )
}
