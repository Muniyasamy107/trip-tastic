import { useEffect, useRef, useState } from 'react'

/**
 * Cinematic hero film.
 *
 * Quality ladder (chosen once, before the request goes out):
 *   · 3840×2160  hero-uhd-4k.mp4      true large displays (≥1900px css width)
 *   · 2560×1440  hero-loop-1440.mp4   laptops / retina desktops
 *   · 1920×1080  hero-loop-1080.mp4   everything else
 *   · stills     (Hero.jsx crossfade) reduced-motion, save-data, 2G, or on error
 *
 * The 4K master is also offered as a download on /design/ for decks and YouTube.
 */
const QUALITY = [
  { min: 1900, src: '/video/hero-uhd-4k.mp4', poster: '/video/hero-poster-4k.jpg', label: '4k' },
  { min: 1100, src: '/video/hero-loop-1440.mp4', poster: '/video/hero-poster-1440.jpg', label: '1440' },
  { min: 0, src: '/video/hero-loop-1080.mp4', poster: '/video/hero-poster-1080.jpg', label: '1080' },
]

function pickQuality() {
  const width = window.innerWidth || 0
  const dpr = window.devicePixelRatio || 1
  const conn = navigator.connection
  const slow = conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType || '')

  if (slow) return QUALITY[2]
  // a 4K panel (or a very large window) gets the UHD master
  if (width >= 1900 && dpr >= 1) return QUALITY[0]
  // retina laptops get 1440p once they are wide enough to show it
  if (width >= 1100 || (width >= 900 && dpr >= 2)) return QUALITY[1]
  return QUALITY[2]
}

export default function HeroVideo({ onReady }) {
  const ref = useRef(null)
  const [quality, setQuality] = useState(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = navigator.connection
    if (conn?.saveData) return
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return
    setQuality(pickQuality())
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || !quality) return

    v.playbackRate = 0.94
    const tryPlay = () => {
      v.play()?.catch(() => {})
    }
    tryPlay()

    const onVisible = () => {
      if (document.hidden) v.pause()
      else tryPlay()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      v.pause()
    }
  }, [quality])

  if (!quality) return null

  return (
    <div className="hero__film" data-quality={quality.label} aria-hidden="true">
      <video
        key={quality.src}
        ref={ref}
        className="hero__video"
        poster={quality.poster}
        muted
        loop
        playsInline
        preload="metadata"
        tabIndex={-1}
        onError={(e) => {
          e.currentTarget.parentElement?.classList.add('is-failed')
        }}
        onCanPlay={(e) => {
          e.currentTarget.classList.add('is-ready')
          onReady?.()
        }}
      >
        <source src={quality.src} type="video/mp4" />
      </video>
    </div>
  )
}
