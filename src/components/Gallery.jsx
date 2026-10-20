import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../lib/scroll'
import { SplitHeading, Reveal } from './ui'
import { gallery } from '../data'
import { lockScroll, unlockScroll } from '../lib/scroll'

function Lightbox({ item, onClose }) {
  const root = useRef(null)

  useEffect(() => {
    lockScroll()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const ctx = gsap.context(() => {
      gsap.from(root.current, { opacity: 0, duration: 0.35, ease: 'power2.out' })
      gsap.from('.lightbox__figure', { scale: 0.94, y: 24, duration: 0.6, ease: 'expo.out', delay: 0.05 })
    }, root)
    return () => {
      window.removeEventListener('keydown', onKey)
      ctx.revert()
      unlockScroll()
    }
  }, [onClose])

  return createPortal(
    <div className="lightbox" ref={root} role="dialog" aria-modal="true" aria-label={item.label} onClick={onClose}>
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close image">
        ✕
      </button>
      <figure className="lightbox__figure" onClick={(e) => e.stopPropagation()}>
        <img src={item.src} alt={item.alt} />
        <figcaption className="lightbox__cap">{item.label}</figcaption>
      </figure>
    </div>,
    document.body,
  )
}

export default function Gallery() {
  const [openItem, setOpenItem] = useState(null)

  return (
    <section className="section section--cream gallery" id="postcards">
      <div className="shell">
        <div className="gallery__head">
          <div>
            <span className="eyebrow eyebrow--ink">Postcards from the road</span>
            <SplitHeading as="h2" text="Shot on *real* trips." />
          </div>
          <Reveal>
            <p>
              No stock libraries, no rented smiles. These are frames from our travellers and guides —
              tap one to see it full size.
            </p>
          </Reveal>
        </div>

        <div className="gallery__grid">
          {gallery.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.04}>
              <button
                type="button"
                className={`gallery__item gallery__item--${g.span || 'wide'}`}
                onClick={() => setOpenItem(g)}
                data-cursor="open"
                aria-label={`Open photo: ${g.label}`}
              >
                <img src={g.src} alt={g.alt} loading="lazy" />
                <span className="gallery__cap">
                  <span>
                    <b>{g.label}</b>
                    <s>Field notes</s>
                  </span>
                  <span className="gallery__zoom" aria-hidden="true">
                    ⤢
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {openItem && <Lightbox item={openItem} onClose={() => setOpenItem(null)} />}
    </section>
  )
}
