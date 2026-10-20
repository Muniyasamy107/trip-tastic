import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/** Bespoke cursor: a tight dot + a lagging ring that expands over links. */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return
    document.documentElement.classList.add('has-cursor')

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' })

    let shown = false
    const onMove = (e) => {
      if (!shown) {
        shown = true
        gsap.to([dot, ring], { opacity: 1, duration: 0.4 })
      }
      dotX(e.clientX)
      dotY(e.clientY)
      ringX(e.clientX)
      ringY(e.clientY)
    }

    const setActive = (active) => {
      gsap.to(ring, {
        scale: active ? 2.1 : 1,
        borderColor: active ? 'rgba(233,166,58,0.9)' : 'rgba(245,239,227,0.45)',
        duration: 0.4,
        ease: 'power3.out',
      })
      gsap.to(dot, { scale: active ? 0.4 : 1, duration: 0.3 })
    }

    const onOver = (e) => {
      if (e.target.closest?.('a, button, input, select, textarea, [data-cursor="hover"]')) {
        setActive(true)
      }
    }
    const onOut = (e) => {
      if (e.target.closest?.('a, button, input, select, textarea, [data-cursor="hover"]')) {
        setActive(false)
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
