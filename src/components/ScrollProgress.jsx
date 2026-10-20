import { useRef } from 'react'
import { gsap } from '../lib/scroll'
import { useIsoLayoutEffect } from '../lib/hooks'

export default function ScrollProgress() {
  const bar = useRef(null)

  useIsoLayoutEffect(() => {
    const tween = gsap.to(bar.current, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
      },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return <div className="scroll-progress" ref={bar} aria-hidden="true" />
}
