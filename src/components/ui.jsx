import { useRef, useMemo } from 'react'
import { useIsoLayoutEffect } from '../lib/hooks'
import { gsap, ScrollTrigger } from '../lib/scroll'

/* ------------------------------------------------------------------ *
 * SplitHeading — word-by-word mask reveal, with *italic* accent words
 * ------------------------------------------------------------------ */
export function SplitHeading({ text, as: Tag = 'h2', className = '', stagger = 0.045, delay = 0, y = 115 }) {
  const ref = useRef(null)

  const words = useMemo(() => {
    const out = []
    String(text)
      .split('*')
      .forEach((part, partIndex) => {
        const italic = partIndex % 2 === 1
        part.split(/\s+/).forEach((w) => {
          if (!w) return
          // glue trailing punctuation onto the previous word so it never floats alone
          if (/^[\u2019'\u201d\".,!?;:)\]]+$/.test(w) && out.length) {
            out[out.length - 1].word += w
          } else {
            out.push({ word: w, italic, key: `${partIndex}-${out.length}` })
          }
        })
      })
    return out
  }, [text])

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const targets = el.querySelectorAll('.word__inner')
    const anim = gsap.fromTo(
      targets,
      { yPercent: y, rotate: 3, opacity: 0 },
      {
        yPercent: 0,
        rotate: 0,
        opacity: 1,
        duration: 1.15,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      },
    )
    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [stagger, delay, y])

  return (
    <Tag ref={ref} className={`split-heading ${className}`}>
      {words.map(({ word, italic, key }) => (
        <span className="word" key={key} aria-hidden="true">
          <span className={`word__inner ${italic ? 'is-italic' : ''}`}>{word}</span>
        </span>
      ))}
      <span className="sr-only">{String(text).replaceAll('*', '')}</span>
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * Reveal — soft entrance on scroll
 * ------------------------------------------------------------------ */
export function Reveal({ children, y = 46, delay = 0, className = '', as: Tag = 'div', once = true, ...rest }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const anim = gsap.fromTo(
      el,
      { y, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.1,
        ease: 'expo.out',
        delay,
        scrollTrigger: { trigger: el, start: 'top 90%', once },
      },
    )
    return () => {
      anim.scrollTrigger?.kill()
      anim.kill()
    }
  }, [y, delay, once])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * Parallax — gentle scroll-linked drift
 * ------------------------------------------------------------------ */
export function Parallax({ children, speed = 12, className = '', ...rest }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tween = gsap.fromTo(
      el,
      { yPercent: -speed / 2 },
      {
        yPercent: speed / 2,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [speed])

  return (
    <div ref={ref} className={className} {...rest}>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Magnetic — buttons that lean toward the pointer
 * ------------------------------------------------------------------ */
export function Magnetic({ children, strength = 0.32, className = '' }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left - r.width / 2) * strength
    const y = (e.clientY - r.top - r.height / 2) * strength
    gsap.to(el, { x, y, duration: 0.55, ease: 'power3.out' })
    gsap.to(el.querySelector('.magnetic__inner') || [], {
      x: x * 0.28,
      y: y * 0.28,
      duration: 0.6,
      ease: 'power3.out',
    })
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
    gsap.to(el.querySelector('.magnetic__inner') || [], { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.45)' })
  }

  return (
    <span ref={ref} className={`magnetic ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      <span className="magnetic__inner">{children}</span>
    </span>
  )
}

/* ------------------------------------------------------------------ *
 * RotatingSeal — circular brand stamp
 * ------------------------------------------------------------------ */
export function RotatingSeal({ text = 'TRIP TASTIC HOLIDAYS · HANDCRAFTED JOURNEYS · ', size = 150, logo = true }) {
  const id = useRef(`seal-${Math.random().toString(36).slice(2, 8)}`).current
  return (
    <div className="seal" style={{ '--seal-size': `${size}px` }}>
      <svg className="seal__ring" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <text>
          <textPath href={`#${id}`} startOffset="2">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="seal__center">
        {logo ? <img src="/brand/emblem.webp" alt="" /> : <span className="seal__arrow">↗</span>}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Stars
 * ------------------------------------------------------------------ */
export function Stars({ count = 5 }) {
  return (
    <span className="stars" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.6l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.5l-5.9 3.1 1.2-6.5L2.5 9.5l6.6-.9z" />
        </svg>
      ))}
    </span>
  )
}

export { ScrollTrigger, gsap }

/* ------------------------------------------------------------------ *
 * SectionHead — index + label + giant title + aside
 * ------------------------------------------------------------------ */
export function SectionHead({ index, label, title, aside, align = 'left' }) {
  return (
    <header className="sec-head">
      <div className="sec-head__meta">
        <span className="sec-head__index">{index}</span>
        <span className="sec-head__label">{label}</span>
      </div>
      <div className="sec-head__body">
        <SplitHeading as="h2" text={title} className="sec-head__title" />
        {aside ? <p className="sec-head__aside">{aside}</p> : null}
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ *
 * Tilt — pointer-reactive 3D card (disabled on touch / reduced motion)
 * ------------------------------------------------------------------ */
export function Tilt({ children, as: Tag = 'div', max = 7, className = '', ...rest }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.set(el, { transformPerspective: 1000, transformStyle: 'preserve-3d' })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.55, ease: 'power3.out' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.55, ease: 'power3.out' })
    const sc = gsap.quickTo(el, 'scale', { duration: 0.6, ease: 'power3.out' })

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * max * 2)
      rx(-py * max * 2)
      el.style.setProperty('--tilt-x', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--tilt-y', `${(py + 0.5) * 100}%`)
    }
    const onEnter = () => sc(1.015)
    const onLeave = () => {
      rx(0)
      ry(0)
      sc(1)
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [max])

  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      {children}
      <span className="tilt__glare" aria-hidden="true" />
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * FrameReveal — curtain wipe for images, with a slow settle zoom
 * ------------------------------------------------------------------ */
export function FrameReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const img = el.querySelector('img')
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 86%', once: true },
      delay,
    })
    tl.fromTo(
      el,
      { clipPath: 'inset(0 0 100% 0)' },
      { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'expo.inOut' },
    )
    if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 1.9, ease: 'expo.out' }, 0.12)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [delay])

  return (
    <div ref={ref} className={`frame-reveal ${className}`}>
      {children}
    </div>
  )
}
