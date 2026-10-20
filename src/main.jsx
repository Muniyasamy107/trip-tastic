import { createRoot } from 'react-dom/client'

import '@fontsource-variable/fraunces/full.css'
import '@fontsource-variable/fraunces/full-italic.css'
import '@fontsource-variable/manrope/index.css'
import 'lenis/dist/lenis.css'

import './styles/base.css'
import './styles/nav-hero.css'
import './styles/sections.css'
import './styles/blocks.css'
import './styles/routes.css'

import App from './App'
import { initSmoothScroll } from './lib/scroll'

// start the smooth-scroll engine before React mounts so the intro can lock it
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
window.scrollTo(0, 0)
initSmoothScroll()

createRoot(document.getElementById('root')).render(<App />)
