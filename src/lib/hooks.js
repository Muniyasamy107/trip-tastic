import { useEffect, useLayoutEffect, useState } from 'react'

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Media queries used across the site — one place, so no component drifts. */
export const QUERY = {
  reduce: '(prefers-reduced-motion: reduce)',
  noReduce: '(prefers-reduced-motion: no-preference)',
  touch: '(hover: none), (pointer: coarse)',
  noHover: '(hover: none)',
  finePointer: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
}

export function matches(query) {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(query).matches
}

/** True when scroll/pointer animation is safe to run (not on reduced-motion, not on touch). */
export const motionAllowed = () => !matches(QUERY.reduce)
export const pointerMotionAllowed = () => !matches(QUERY.reduce) && !matches(QUERY.touch)

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matches(QUERY.reduce))
  useEffect(() => {
    const mq = window.matchMedia(QUERY.reduce)
    const onChange = () => setReduced(mq.matches)
    setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

/** Scroll-linked value that follows the whole document — shared by the progress bar and the rail. */
export function useScrollFlag(offset = 60) {
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    const onScroll = () => setPassed(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return passed
}
