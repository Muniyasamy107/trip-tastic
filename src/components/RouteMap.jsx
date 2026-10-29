import { useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import { useIsoLayoutEffect, useReducedMotion, motionAllowed } from '../lib/hooks'
import { SectionHead } from './ui'
import { sectionIndex, trip } from '../data'
import { chooseDestination, priceFrom } from '../lib/trip'

const ORIGIN = { x: 150, y: 300 }

/** Only the geometry lives here — names, days and prices come from data.js. */
const geometry = [
  { id: 'ladakh', to: { x: 690, y: 74 }, ctrl: { x: 400, y: 10 } },
  { id: 'himachal', to: { x: 784, y: 148 }, ctrl: { x: 470, y: 52 } },
  { id: 'rajasthan', to: { x: 652, y: 222 }, ctrl: { x: 396, y: 146 } },
  { id: 'goa', to: { x: 700, y: 304 }, ctrl: { x: 430, y: 268 } },
  { id: 'ooty', to: { x: 742, y: 386 }, ctrl: { x: 452, y: 352 } },
  { id: 'bali', to: { x: 878, y: 474 }, ctrl: { x: 560, y: 452 } },
]

const routes = geometry.map((route) => {
  const destination = trip(route.id)
  return {
    ...route,
    label: destination.name,
    days: destination.days,
    price: priceFrom(destination),
  }
})

const path = (r) => `M${ORIGIN.x},${ORIGIN.y} Q${r.ctrl.x},${r.ctrl.y} ${r.to.x},${r.to.y}`

export default function RouteMap() {
  const svg = useRef(null)
  const [active, setActive] = useState(null)
  const reduced = useReducedMotion()

  useIsoLayoutEffect(() => {
    const el = svg.current
    if (!el) return
    if (!motionAllowed()) return

    const paths = Array.from(el.querySelectorAll('.route__path')).filter(
      (p) => typeof p.getTotalLength === 'function',
    )
    if (!paths.length) return
    const ctx = gsap.context(() => {
      paths.forEach((p, i) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
        gsap.to(p, {
          strokeDashoffset: 0,
          duration: 1.9,
          ease: 'power2.inOut',
          delay: i * 0.1,
          scrollTrigger: { trigger: el, start: 'top 78%', once: true },
        })
      })
    }, el)
    return () => ctx.revert()
  }, [])

  const pick = (label) => chooseDestination(label)

  return (
    <section className="routes section--dark" id="routes">
      <div className="shell">
        <SectionHead
          index={sectionIndex('routes')}
          label="The route network"
          title="One hub. *Every* horizon."
          aside="Every Trip Tastic journey starts at our Chennai studio and fans out across the subcontinent and beyond. Pick a line, we’ll fly it for you."
        />

        <div className="routes__stage">
          <div className="routes__canvas">
            <svg ref={svg} viewBox="0 0 1000 560" role="img" aria-label="Route map fanning out from Chennai to six destinations">
              <defs>
                <linearGradient id="route-gold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8f7338" stopOpacity="0.15" />
                  <stop offset="55%" stopColor="#c9a45c" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#ebd3a0" stopOpacity="0.95" />
                </linearGradient>
                <radialGradient id="node-glow">
                  <stop offset="0%" stopColor="#ebd3a0" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ebd3a0" stopOpacity="0" />
                </radialGradient>
              </defs>

              {routes.map((r) => (
                <g key={r.id} className={`route ${active === r.id ? 'is-active' : ''}`}>
                  <path className="route__path" d={path(r)} fill="none" stroke="url(#route-gold)" strokeWidth="1.15" />
                  <path className="route__hit" d={path(r)} fill="none" stroke="transparent" strokeWidth="18" />
                  {!reduced && (
                    <circle className="route__plane" r="2.6" fill="#f3e2b8">
                      <animateMotion dur={`${7 + (r.to.y % 3)}s`} repeatCount="indefinite" begin={`${0.4 + routes.indexOf(r) * 0.55}s`}>
                        <mpath href={`#motion-${r.id}`} />
                      </animateMotion>
                    </circle>
                  )}
                  <line
                    className="route__tick"
                    x1={r.to.x + 10}
                    y1={r.to.y}
                    x2={r.to.x + 30}
                    y2={r.to.y}
                    stroke="#c9a45c"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                  />
                  <circle className="route__node" cx={r.to.x} cy={r.to.y} r="4" />
                  <circle className="route__halo" cx={r.to.x} cy={r.to.y} r="16" fill="url(#node-glow)" />
                  <text className="route__label" x={r.to.x + 38} y={r.to.y + 1}>
                    {r.label}
                  </text>
                  <text className="route__sub" x={r.to.x + 38} y={r.to.y + 15}>
                    {r.price}
                  </text>
                </g>
              ))}

              {/* motion paths (referenced above, invisible) */}
              {routes.map((r) => (
                <path key={`m-${r.id}`} id={`motion-${r.id}`} d={path(r)} fill="none" stroke="none" />
              ))}

              <g className="route__origin">
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r="30" fill="url(#node-glow)" />
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r="7" className="route__pulse" />
                <circle cx={ORIGIN.x} cy={ORIGIN.y} r="3" fill="#ebd3a0" />
                <line x1={ORIGIN.x - 46} y1={ORIGIN.y} x2={ORIGIN.x - 14} y2={ORIGIN.y} stroke="#c9a45c" strokeOpacity="0.5" />
                <text className="route__hub" x={ORIGIN.x - 54} y={ORIGIN.y - 2} textAnchor="end">
                  Chennai
                </text>
                <text className="route__sub" x={ORIGIN.x - 54} y={ORIGIN.y + 12} textAnchor="end">
                  13.08° N · hub
                </text>
              </g>
            </svg>

            {routes.map((r) => (
              <button
                key={`hit-${r.id}`}
                type="button"
                className="routes__hit"
                style={{
                  left: `${(r.to.x / 1000) * 100}%`,
                  top: `${(r.to.y / 560) * 100}%`,
                }}
                onMouseEnter={() => setActive(r.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(r.id)}
                onBlur={() => setActive(null)}
                onClick={() => pick(r.label)}
                aria-label={`Plan a journey to ${r.label}, ${r.price}`}
              />
            ))}
          </div>

          <aside className="routes__list">
            <span className="routes__list-title">Departures from Chennai</span>
            <ul>
              {routes.map((r) => {
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      className={`routes__row ${active === r.id ? 'is-active' : ''}`}
                      onMouseEnter={() => setActive(r.id)}
                      onMouseLeave={() => setActive(null)}
                      onClick={() => pick(r.label)}
                    >
                      <span className="routes__row-id">TT-{String(routes.indexOf(r) + 1).padStart(3, '0')}</span>
                      <span className="routes__row-name">
                        {r.label}
                        <i>{r.days} days · private</i>
                      </span>
                      <span className="routes__row-price">{r.price.replace('from ', '')}</span>
                      <span className="routes__row-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <p className="routes__note">
              Every route is a starting sketch. Dates, pace and stays get rebuilt around you.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
