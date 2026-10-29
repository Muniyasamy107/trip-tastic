import { useEffect, useRef } from 'react'
import { gsap } from '../lib/scroll'
import { matches, QUERY } from '../lib/hooks'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const label = useRef(null)

  useEffect(() => {
    if (matches(QUERY.touch)) return

    document.documentElement.classList.add('has-cursor')
    gsap.set([dot.current, ring.current], { x: -120, y: -120 })

    const dotX = gsap.quickTo(dot.current, 'x', { duration: 0.12, ease: 'power3.out' })
    const dotY = gsap.quickTo(dot.current, 'y', { duration: 0.12, ease: 'power3.out' })
    const ringX = gsap.quickTo(ring.current, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring.current, 'y', { duration: 0.45, ease: 'power3.out' })

    const onMove = (e) => {
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const onOver = (e) => {
      const hot = e.target.closest('a, button, [data-cursor], .dest-card, .gallery__item')
      if (hot) {
        ring.current?.classList.add('is-hot')
        const text = hot.getAttribute('data-cursor')
        if (label.current) label.current.textContent = text || (hot.tagName === 'A' || hot.tagName === 'BUTTON' ? 'click' : 'view')
      } else {
        ring.current?.classList.remove('is-hot')
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, true)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver, true)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <>
      <div className="cursor" ref={dot} aria-hidden="true">
        <div className="cursor__dot" />
      </div>
      <div className="cursor__ring" ref={ring} aria-hidden="true">
        <span className="cursor__label" ref={label}>
          view
        </span>
      </div>
    </>
  )
}
