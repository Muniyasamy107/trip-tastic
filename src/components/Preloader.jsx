import { useRef, useState } from 'react'
import { gsap, lockScroll, unlockScroll } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'
import { Scramble } from './ui'

export default function Preloader({ onDone }) {
  const root = useRef(null)
  const [count, setCount] = useState(0)

  useIsoLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lockScroll()

    if (reduce) {
      setCount(100)
      unlockScroll()
      gsap.set(root.current, { display: 'none' })
      onDone?.()
      return
    }

    const counter = { val: 0 }
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => gsap.set(root.current, { display: 'none' }),
      })

      tl.from('.preloader__logo', { y: 24, opacity: 0, scale: 0.9, duration: 1.1 }, 0.15)
        .from('.preloader__word', { y: 20, opacity: 0, duration: 0.8 }, 0.4)
        .from('.preloader__meta', { opacity: 0, duration: 0.6 }, 0.6)
        .to('.preloader__bar span', { scaleX: 1, duration: 2.1, ease: 'power1.inOut' }, 0.3)
        .to(
          counter,
          {
            val: 100,
            duration: 2.1,
            ease: 'power1.inOut',
            onUpdate: () => setCount(Math.round(counter.val)),
          },
          0.3,
        )
        .to('.preloader__content', { y: -26, opacity: 0, duration: 0.6, ease: 'power2.in' }, '+=0.2')
        .add(() => {
          unlockScroll()
          onDone?.()
        })
        .to('.preloader__panel--top', { yPercent: -101, duration: 1.2, ease: 'expo.inOut' }, '-=0.15')
        .to('.preloader__panel--bottom', { yPercent: 101, duration: 1.2, ease: 'expo.inOut' }, '<')
    }, root)

    return () => {
      ctx.revert()
      unlockScroll()
    }
  }, [onDone])

  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader__panel preloader__panel--top" />
      <div className="preloader__panel preloader__panel--bottom" />
      <div className="preloader__content">
        <img className="preloader__logo" src="/brand/logo.webp" alt="" width="190" height="190" />
        <div className="preloader__word">
          <Scramble text="Trip Tastic" startOnView={false} delay={0.5} />
          <span>Holidays</span>
        </div>
        <div className="preloader__bar">
          <span />
        </div>
        <div className="preloader__meta">
          <span>Packing the good stuff</span>
          <span className="preloader__count">{String(count).padStart(3, '0')}</span>
        </div>
      </div>
    </div>
  )
}
