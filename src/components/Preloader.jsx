import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { EASE } from '../lib/motion'

export default function Preloader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    const start = performance.now()
    const duration = 1900

    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1)
      // ease-out cubic so the counter decelerates like a real load
      const eased = 1 - Math.pow(1 - t, 3)
      setProgress(Math.round(eased * 100))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else {
        window.setTimeout(() => setExiting(true), 260)
        window.setTimeout(() => {
          document.documentElement.classList.remove('is-loading')
          onDone?.()
        }, 1080)
      }
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf.current)
      document.documentElement.classList.remove('is-loading')
    }
  }, [onDone])

  return (
    <motion.div
      className="preloader"
      aria-hidden={exiting || undefined}
      animate={exiting ? { y: '-100%' } : { y: '0%' }}
      transition={{ duration: 0.95, ease: EASE }}
    >
      <div className="preloader-inner">
        <div className="preloader-brand">
          <motion.img
            src="/images/logo.jpeg"
            alt=""
            className="preloader-logo"
            initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
          <div className="preloader-wordmark">
            <span>TripTastic</span>
            <span className="preloader-sub">Holidays</span>
          </div>
        </div>

        <motion.p
          className="preloader-tag"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9 }}
        >
          Packing the good kind of detours…
        </motion.p>
      </div>

      <div className="preloader-foot">
        <div className="preloader-bar">
          <motion.span
            className="preloader-bar-fill"
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.2, ease: 'linear' }}
          />
        </div>
        <div className="preloader-meta">
          <span>Curated since 2014</span>
          <span className="preloader-count">{String(progress).padStart(3, '0')}</span>
        </div>
      </div>
    </motion.div>
  )
}
