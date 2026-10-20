import { motion } from 'framer-motion'
import { EASE, lineReveal, viewport } from '../../lib/motion'

/** Clipped, staggered line reveal. Each child becomes one masked line. */
export function SplitLines({ lines, as: Tag = 'h2', className = '', delay = 0 }) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={typeof line === 'string' ? line : i}>
          <motion.span
            className="line-inner"
            custom={i + delay}
            variants={lineReveal}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/** Simple fade + rise on scroll into view. */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  className = '',
  as = 'div',
  once = true,
}) {
  const Comp = motion[as] || motion.div
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

export function Eyebrow({ children, className = '' }) {
  return (
    <motion.p
      className={`eyebrow ${className}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewport}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <span className="eyebrow-dot" aria-hidden="true" />
      {children}
    </motion.p>
  )
}

export function Arrow({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="arrow-icon"
    >
      <path
        d="M3 13L13 3M13 3H5.5M13 3V10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
