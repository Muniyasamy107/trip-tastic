import { useCallback, useEffect, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useSmoothScroll from './lib/smoothScroll'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Manifesto from './components/Manifesto'
import Journeys from './components/Journeys'
import Expedition from './components/Expedition'
import Craft from './components/Craft'
import Stories from './components/Stories'
import Faq from './components/Faq'
import Plan from './components/Plan'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'

export default function App() {
  const [ready, setReady] = useState(false)

  useSmoothScroll(true)

  const handleLoaded = useCallback(() => {
    setReady(true)
    requestAnimationFrame(() => ScrollTrigger.refresh())
  }, [])

  /* Warm the 3D chunk while the preloader is still on screen. */
  useEffect(() => {
    const id = window.setTimeout(() => {
      import('./components/globe/GlobeScene')
    }, 250)
    return () => window.clearTimeout(id)
  }, [])

  /* Re-measure once the lazy 3D scene + fonts have painted. */
  useEffect(() => {
    if (!ready) return undefined
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 900)
    return () => window.clearTimeout(id)
  }, [ready])

  return (
    <>
      <Preloader onDone={handleLoaded} />
      <Cursor />
      <ScrollProgress />
      <a className="skip" href="#journeys">
        Skip to journeys
      </a>

      <Nav />

      <main>
        <Hero ready={ready} />
        <Marquee />
        <Manifesto />
        <Journeys />
        <Expedition />
        <Craft />
        <Stories />
        <Faq />
        <Plan />
      </main>

      <Footer />
      <BackToTop />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
