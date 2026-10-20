import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MANIFESTO_ACCENTS, MANIFESTO_WORDS } from '../data/content'
import { Eyebrow } from './ui/Reveal'

gsap.registerPlugin(ScrollTrigger)

const clean = (w) => w.replace(/[’'",.—]/g, '').toLowerCase()
const accents = new Set(MANIFESTO_ACCENTS.map(clean))

export default function Manifesto() {
  const root = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray('.manifesto-word')

      if (reduce) {
        gsap.set(words, { opacity: 1 })
        return
      }

      gsap.set(words, { opacity: 0.13 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=150%',
          scrub: 0.5,
          pin: '.manifesto-pin',
          anticipatePin: 1,
        },
      })

      tl.to(words, {
        opacity: 1,
        stagger: 0.4,
        ease: 'none',
        duration: 2,
      })

      gsap.to('.manifesto-stamp', {
        rotate: 220,
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=150%',
          scrub: 1,
        },
      })

      gsap.to('.manifesto-line', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=150%',
          scrub: 0.4,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section className="manifesto" id="way" ref={root}>
      <div className="manifesto-pin">
        <div className="manifesto-glow" aria-hidden="true" />
        <div className="shell manifesto-shell">
          <div className="manifesto-head">
            <Eyebrow>The way we travel</Eyebrow>
            <span className="manifesto-count">
              <span className="manifesto-line" />
              Manifesto No. 01
            </span>
          </div>

          <p className="manifesto-text">
            {MANIFESTO_WORDS.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={`manifesto-word ${accents.has(clean(word)) ? 'is-accent' : ''}`}
              >
                {word}{' '}
              </span>
            ))}
          </p>

          <div className="manifesto-foot">
            <span>— The TripTastic field notes</span>
            <span>Chennai · Leh · Ubud · Reykjavík</span>
          </div>
        </div>

        <div className="manifesto-stamp" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <path id="stampCircle" d="M60,60 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
            </defs>
            <text>
              <textPath href="#stampCircle" startOffset="0%">
                WANDER WILDLY · RETURN DIFFERENT · EST 2014 ·
              </textPath>
            </text>
            <path
              d="M60 40l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z"
              fill="currentColor"
              opacity="0.9"
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
