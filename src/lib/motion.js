export const EASE = [0.16, 1, 0.3, 1]
export const EASE_SOFT = [0.22, 0.61, 0.36, 1]

export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.06 * i, ease: EASE },
  }),
}

export const lineReveal = {
  hidden: { y: '112%', rotate: 3 },
  show: (i = 0) => ({
    y: '0%',
    rotate: 0,
    transition: { duration: 1.05, delay: 0.08 * i, ease: EASE },
  }),
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}

export const viewport = { once: true, margin: '-12% 0px -12% 0px' }
