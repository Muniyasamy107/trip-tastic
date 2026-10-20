import { useCallback, useEffect, useState } from 'react'
import { initSmoothScroll, ScrollTrigger, scrollToId } from './lib/scroll'
import Preloader from './components/Preloader'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import JourneyRail from './components/JourneyRail'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import Press from './components/Press'
import Story from './components/Story'
import Destinations from './components/Destinations'
import Way from './components/Way'
import RouteMap from './components/RouteMap'
import Spotlight from './components/Spotlight'
import Gallery from './components/Gallery'
import Testimonials from './components/Testimonials'
import Enquiry from './components/Enquiry'
import Footer from './components/Footer'
import FloatCTA from './components/FloatCTA'
import SoundToggle from './components/SoundToggle'

export default function App() {
  const [ready, setReady] = useState(false)
  const onIntroDone = useCallback(() => setReady(true), [])

  useEffect(() => {
    initSmoothScroll()

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    const t = window.setTimeout(refresh, 1800)

    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 350)
    return () => window.clearTimeout(t)
  }, [ready])

  // smooth-scroll every in-page anchor, including ones we didn't wire by hand
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('a[href^="#"]')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href || href.length < 2) return
      const target = document.querySelector(href)
      if (!target) return
      e.preventDefault()
      scrollToId(href)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Preloader onDone={onIntroDone} />
      <Cursor />
      <ScrollProgress />
      <JourneyRail />
      <Nav />

      <main id="main">
        <Hero ready={ready} />
        <Marquee />
        <Press />
        <Story />
        <Destinations />
        <Way />
        <RouteMap />
        <Spotlight />
        <Gallery />
        <Testimonials />
        <Enquiry />
      </main>

      <Footer />
      <FloatCTA />
      <SoundToggle />
      <div className="grain" aria-hidden="true" />
    </>
  )
}
