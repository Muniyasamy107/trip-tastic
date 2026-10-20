import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'

const places = ['Kerala', 'Ladakh', 'Rajasthan', 'Bali', 'Himachal', 'Andaman', 'Goa', 'Ooty']

function Group() {
  return (
    <div className="marquee__group">
      {places.map((p, i) => (
        <span className={`marquee__item ${i % 2 === 1 ? 'is-solid' : ''}`} key={p}>
          {p}
        </span>
      ))}
    </div>
  )
}

export default function Marquee() {
  const track = useRef(null)
  const band = useRef(null)

  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const st = ScrollTrigger.create({
      trigger: track.current,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        const v = self.getVelocity()
        gsap.to(band.current, {
          skewX: gsap.utils.clamp(-6, 6, v / -320),
          duration: 0.7,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      },
    })
    return () => st.kill()
  }, [])

  return (
    <div className="marquee" aria-hidden="true" ref={band}>
      <div className="marquee__track" ref={track}>
        <Group />
        <Group />
        <Group />
        <Group />
      </div>
    </div>
  )
}
