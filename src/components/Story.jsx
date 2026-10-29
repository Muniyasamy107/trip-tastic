import { useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/scroll'
import { useIsoLayoutEffect, motionAllowed } from '../lib/hooks'
import { SplitHeading, Reveal, Parallax, RotatingSeal, FrameReveal, BtnIcon, SEAL_TEXT } from './ui'
import { IconCompass, IconBed, IconChat } from './icons'
import { stats } from '../data'
import ooty from '../assets/ooty.webp'
import kerala from '../assets/kerala.webp'

const features = [
  {
    icon: <IconCompass />,
    title: 'Local eyes, everywhere',
    text: 'Our guides grew up on these roads. They know which tea stall opens at sunrise and which viewpoint the buses miss.',
  },
  {
    icon: <IconBed />,
    title: 'Boutique over big-box',
    text: 'Heritage havelis, houseboats and hillside cabins — every stay is visited, photographed and hand-picked before it makes your itinerary.',
  },
  {
    icon: <IconChat />,
    title: 'One WhatsApp thread',
    text: 'From the first idea to the last airport drop, one team, one chat, and a human who answers at 2am if your flight lands late.',
  },
]

function Counter({ value, decimals = 0 }) {
  const ref = useRef(null)

  useIsoLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (!motionAllowed()) {
      el.textContent = value.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      return
    }
    const obj = { v: 0 }
    el.textContent = (0).toFixed(decimals)
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 92%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          v: value,
          duration: 2.1,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = obj.v.toLocaleString('en-IN', {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            })
          },
        })
      },
    })
    return () => st.kill()
  }, [value, decimals])

  return <span ref={ref}>0</span>
}

export default function Story() {
  return (
    <section className="section section--cream story" id="story">
      <div className="shell">
        <div className="story__grid">
          <div className="story__visual">
            <Parallax speed={7}>
              <FrameReveal className="story__main frame">
                <img src={ooty} alt="Misty tea plantations in the Nilgiri hills near Ooty" loading="lazy" />
              </FrameReveal>
            </Parallax>

            <Parallax speed={-11} className="story__small">
              <div className="frame" style={{ height: '100%' }}>
                <img src={kerala} alt="A houseboat drifting through the Kerala backwaters" loading="lazy" />
              </div>
            </Parallax>

            <div className="story__badge">
              <RotatingSeal size={132} text={SEAL_TEXT.house} />
            </div>

            <div className="story__note">
              <b>98%</b>
              <span>travellers travel with us again</span>
            </div>
          </div>

          <div className="story__copy">
            <span className="eyebrow eyebrow--ink">Why Trip Tastic</span>
            <SplitHeading
              as="h2"
              text="We don’t sell trips. We design *memories*."
              className="story__title"
            />
            <Reveal>
              <p className="lede">
                Trip Tastic began in a Chennai living room with one borrowed jeep and a stubborn belief:
                a holiday should feel like it was made for you — <b>because it was.</b> Twelve years and
                four thousand travellers later, that’s still the whole plan.
              </p>
            </Reveal>

            <div className="story__features">
              {features.map((feature, i) => (
                <Reveal className="feature" delay={0.05 + i * 0.05} key={feature.title}>
                  <span className="feature__icon">{feature.icon}</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="story__sign">
              <a className="btn btn--ink" href="#way">
                See how we travel
                <BtnIcon>↓</BtnIcon>
              </a>
              <span className="signature">
                <b>The Trip Tastic team</b>
                <span>Founder-led · Since 2014</span>
              </span>
            </div>
          </div>
        </div>

        <div className="stats">
          {stats.map((s) => (
            <div className="stat" key={s.label}>
              <span className="stat__value">
                <Counter value={s.value} decimals={s.decimals || 0} />
                <i>{s.suffix}</i>
              </span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
