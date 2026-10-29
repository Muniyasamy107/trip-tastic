import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motionAllowed } from './hooks'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power3.out', duration: 1 })

/** One ScrollTrigger config for "whole page" scrubs (progress bar, journey rail). */
export const pageScrub = {
  trigger: () => document.documentElement,
  start: 'top top',
  end: 'bottom bottom',
}

let lenis = null

export function initSmoothScroll() {
  if (lenis) return lenis
  if (typeof window === 'undefined') return null

  const reduce = !motionAllowed()

  lenis = new Lenis({
    duration: reduce ? 0.1 : 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: !reduce,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4,
    infinite: false,
  })

  lenis.on('scroll', ScrollTrigger.update)

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  return lenis
}

export function getLenis() {
  return lenis
}

export function scrollToId(id) {
  const target = typeof id === 'string' ? document.querySelector(id) : id
  if (!target) return
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export function lockScroll() {
  lenis?.stop()
  document.documentElement.classList.add('is-locked')
}

export function unlockScroll() {
  lenis?.start()
  document.documentElement.classList.remove('is-locked')
}

export { gsap, ScrollTrigger }
