import { useCallback, useEffect, useRef, useState } from 'react'
import { startAmbience, stopAmbience } from '../lib/ambience'

const KEY = 'tt-ambience'

const store = {
  get() {
    try {
      return window.localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(value) {
    try {
      window.localStorage.setItem(KEY, value)
    } catch {
      /* private mode — ignore */
    }
  },
}

export default function SoundToggle() {
  const [on, setOn] = useState(false)
  const onRef = useRef(false)

  const toggle = useCallback(async (force) => {
    const next = typeof force === 'boolean' ? force : !onRef.current
    if (next) {
      const ok = await startAmbience()
      onRef.current = ok
      setOn(ok)
      store.set(ok ? 'on' : 'off')
    } else {
      stopAmbience()
      onRef.current = false
      setOn(false)
      store.set('off')
    }
  }, [])

  // if sound was left on, wait for the first gesture (browser autoplay rules)
  useEffect(() => {
    if (store.get() !== 'on') return
    const resume = () => toggle(true)
    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })
    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
    }
  }, [toggle])

  useEffect(() => () => stopAmbience(), [])

  return (
    <button
      type="button"
      className={`sound ${on ? 'is-on' : ''}`}
      onClick={() => toggle()}
      aria-pressed={on}
      aria-label={on ? 'Turn ambient sound off' : 'Turn ambient sound on'}
      title={on ? 'Ambient sound: on' : 'Ambient sound: off'}
    >
      <span className="sound__bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="sound__text">{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}
