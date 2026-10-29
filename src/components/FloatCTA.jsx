import { contact } from '../data'
import { useScrollFlag } from '../lib/hooks'
import { IconWhatsApp } from './icons'

export default function FloatCTA() {
  const show = useScrollFlag(typeof window === 'undefined' ? 0 : window.innerHeight * 0.9)

  return (
    <a
      className={`float-cta ${show ? 'is-visible' : ''}`}
      href={contact.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Trip Tastic on WhatsApp"
    >
      <span className="float-cta__dot" aria-hidden="true">
        <IconWhatsApp />
      </span>
      <span>Chat with a planner</span>
    </a>
  )
}
