import { useEffect, useRef, useState } from 'react'

/**
 * Cinematic hero video layer.
 * - sits above the still crossfade sequence, below the text
 * - never autoplays for save-data / reduced-motion / slow connections
 * - silently falls back to the stills if the file can't load
 */
export default function HeroVideo({ onReady }) {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const conn = navigator.connection
    if (conn?.saveData) return
    if (conn?.effectiveType && /(^|-)2g$/.test(conn.effectiveType)) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v || !enabled) return

    v.playbackRate = 0.92
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
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="hero__film" aria-hidden="true">
      <video
        ref={ref}
        className="hero__video"
        poster="/video/hero-poster.jpg"
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
        <source src="/video/hero-loop.mp4" type="video/mp4" />
      </video>
    </div>
  )
}
