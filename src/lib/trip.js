/**
 * One way to start a trip enquiry from anywhere on the page.
 *
 * Destinations, the route map and the hero all used to repeat the same
 * `dispatchEvent + scrollToId` pair; they now call `chooseDestination()`.
 */
import { scrollToId } from './scroll'

export const DESTINATION_EVENT = 'tt:destination'

export function chooseDestination(name) {
  window.dispatchEvent(new CustomEvent(DESTINATION_EVENT, { detail: name }))
  scrollToId('#enquiry')
}

export function onDestination(handler) {
  window.addEventListener(DESTINATION_EVENT, handler)
  return () => window.removeEventListener(DESTINATION_EVENT, handler)
}

/** "₹32,500" → "from ₹32,500" — the formatter used by the route map and cards. */
export const priceFrom = (destination) => `from ${destination.price}`
