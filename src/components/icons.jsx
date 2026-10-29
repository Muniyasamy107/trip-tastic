/**
 * Shared line icons.
 *
 * The WhatsApp bubble, compass, bed and contact glyphs used to be pasted inline in
 * Story, Way, Enquiry and FloatCTA. They now live here once.
 * Every icon inherits `currentColor` and stroke width, so the CSS stays as it was.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const Svg = ({ children, ...rest }) => (
  <svg {...base} {...rest}>
    {children}
  </svg>
)

export const IconChat = (props) => (
  <Svg {...props}>
    <path d="M21 11.5a8.4 8.4 0 01-9 8.4 9.5 9.5 0 01-3.2-.5L3 21l1.6-4.6A8.4 8.4 0 1121 11.5z" />
    <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" />
  </Svg>
)

export const IconCompass = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15.2 8.8l-2 4.4-4.4 2 2-4.4z" />
  </Svg>
)

export const IconBed = (props) => (
  <Svg {...props}>
    <path d="M3 18v-6a2 2 0 012-2h14a2 2 0 012 2v6" />
    <path d="M3 18h18M6 10V7a1 1 0 011-1h4a1 1 0 011 1v3M12 10V8a1 1 0 011-1h4a1 1 0 011 1v2" />
    <path d="M3 18v2M21 18v2" />
  </Svg>
)

export const IconPhone = (props) => (
  <Svg {...props}>
    <path d="M4 4h4l2 5-2.5 1.5a12 12 0 006 6L15 14l5 2v4a2 2 0 01-2 2A17 17 0 012 6a2 2 0 012-2z" />
  </Svg>
)

export const IconMail = (props) => (
  <Svg {...props}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
)

export const IconPin = (props) => (
  <Svg {...props}>
    <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
)

export const IconShield = (props) => (
  <Svg {...props}>
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
)

/** Filled WhatsApp mark for the floating concierge button. */
export const IconWhatsApp = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 00-8.6 15L2 22l5.2-1.4A10 10 0 1012 2zm0 2a8 8 0 016.7 12.4l-.3.4.8 2.8-2.9-.8-.4.2A8 8 0 1112 4zm-3.1 4.3c-.2 0-.5.1-.7.4-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.5 2.5 3.8 3.4 1.9.7 2.3.6 2.7.5.4 0 1.3-.5 1.5-1 .2-.6.2-1 .1-1.1 0-.1-.2-.2-.5-.3l-1.5-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.4 6.4 0 01-1.9-1.2 7 7 0 01-1.3-1.6c-.1-.2 0-.3.1-.4l.4-.5c.1-.2.1-.3 0-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4z" />
  </svg>
)

export const IconArrowLeft = (props) => (
  <Svg {...props}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
)

export const IconArrowRight = (props) => (
  <Svg {...props}>
    <path d="M9 5l7 7-7 7" />
  </Svg>
)
