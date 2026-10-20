import { useEffect, useState } from 'react'
import { contact } from '../data'

export default function FloatCTA() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.9)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      className={`float-cta ${show ? 'is-visible' : ''}`}
      href={contact.whatsapp}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with Trip Tastic on WhatsApp"
    >
      <span className="float-cta__dot" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 2a8 8 0 016.7 12.4l-.3.4.8 2.8-2.9-.8-.4.2A8 8 0 1112 4zm-3.1 4.3c-.2 0-.5.1-.7.4-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.5 2.5 3.8 3.4 1.9.7 2.3.6 2.7.5.4 0 1.3-.5 1.5-1 .2-.6.2-1 .1-1.1 0-.1-.2-.2-.5-.3l-1.5-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 01-1.9-1.2 7 7 0 01-1.3-1.6c-.1-.2 0-.3.1-.4l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4z" />
        </svg>
      </span>
      <span>Chat with a planner</span>
    </a>
  )
}
