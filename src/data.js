import kerala from './assets/kerala.webp'
import ladakh from './assets/ladakh.webp'
import rajasthan from './assets/rajasthan.webp'
import bali from './assets/bali.webp'
import himachal from './assets/himachal.webp'
import andaman from './assets/andaman.webp'
import ooty from './assets/ooty.webp'
import goa from './assets/goa.webp'
import hero from './assets/hero.webp'

export const heroImg = hero

/** The eight chapters of the page. Nav, fullscreen menu, journey rail and footer all read this. */
export const chapters = [
  { index: '01', label: 'Destinations', nav: 'Destinations', href: '#destinations' },
  { index: '02', label: 'The House', nav: 'The House', href: '#story' },
  { index: '03', label: 'The Way', nav: 'The Way', href: '#way' },
  { index: '04', label: 'Routes', nav: 'Routes', href: '#routes' },
  { index: '05', label: 'Spotlight', nav: 'Spotlight', href: '#spotlight' },
  { index: '06', label: 'Postcards', nav: 'Postcards', href: '#postcards' },
  { index: '07', label: 'Stories', nav: 'Stories', href: '#stories' },
  { index: '08', label: 'Enquire', nav: 'Plan my journey', href: '#enquiry' },
]

/** Nav + menu show the first seven; the enquiry chapter is the CTA. */
export const navLinks = chapters.filter((c) => c.href !== '#enquiry')
export const enquiryChapter = chapters[chapters.length - 1]

/** Section number for a chapter id, e.g. sectionIndex('story') → '02'. */
export const sectionIndex = (id) => chapters.find((c) => c.href === `#${id}`)?.index ?? ''

export const press = [
  'Condé Nast Traveller',
  'Travel + Leisure',
  'Outlook Traveller',
  'Lonely Planet',
  'National Geographic Traveller',
]

export const destinations = [
  {
    id: 'kerala',
    name: 'Kerala',
    region: 'God’s own country',
    days: 6,
    price: '₹24,900',
    tag: 'Most loved',
    accent: '#7fd6a4',
    image: kerala,
  },
  {
    id: 'ladakh',
    name: 'Ladakh',
    region: 'The high passes',
    days: 7,
    price: '₹32,500',
    tag: 'Adventure',
    accent: '#8fb6ff',
    image: ladakh,
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    region: 'Palaces & dunes',
    days: 5,
    price: '₹21,400',
    tag: 'Heritage',
    accent: '#ffb26b',
    image: rajasthan,
  },
  {
    id: 'bali',
    name: 'Bali',
    region: 'Temples & terraces',
    days: 6,
    price: '₹49,900',
    tag: 'International',
    accent: '#ffd36e',
    image: bali,
  },
  {
    id: 'himachal',
    name: 'Himachal',
    region: 'Snowline escapes',
    days: 5,
    price: '₹18,900',
    tag: 'Honeymoon',
    accent: '#bfe4ff',
    image: himachal,
  },
  {
    id: 'andaman',
    name: 'Andaman',
    region: 'Blue in every shade',
    days: 5,
    price: '₹28,700',
    tag: 'Beach',
    accent: '#7be3e0',
    image: andaman,
  },
  {
    id: 'ooty',
    name: 'Ooty',
    region: 'Nilgiri mist',
    days: 3,
    price: '₹9,900',
    tag: 'Weekend',
    accent: '#9fe08a',
    image: ooty,
  },
  {
    id: 'goa',
    name: 'Goa',
    region: 'Salt, sunsets, susegad',
    days: 4,
    price: '₹14,600',
    tag: 'Weekend',
    accent: '#ffa98c',
    image: goa,
  },
]

export const steps = [
  {
    kicker: 'Step 01',
    title: 'Tell us your dream',
    text: 'A 15-minute call — your dates, your people, the vibe you’re chasing. No forms with 40 fields, no pushy follow-ups.',
  },
  {
    kicker: 'Step 02',
    title: 'We design the route',
    text: 'A real human builds a day-by-day itinerary around your pace, then tweaks it until it feels exactly like you.',
  },
  {
    kicker: 'Step 03',
    title: 'Stays with a story',
    text: 'Boutique villas, heritage havelis, houseboats and quiet cabins — hand-inspected, never a generic chain.',
  },
  {
    kicker: 'Step 04',
    title: 'You travel. We stay close.',
    text: 'A private local guide, transfers that actually show up, and a 24/7 WhatsApp line from take-off to touchdown.',
  },
]

export const stats = [
  { value: 12, suffix: '+', label: 'Years crafting journeys' },
  { value: 4800, suffix: '+', label: 'Happy travellers' },
  { value: 68, suffix: '', label: 'Destinations curated' },
  { value: 4.9, suffix: '/5', label: 'Average trip rating', decimals: 1 },
]

export const testimonials = [
  {
    quote:
      'We asked for “somewhere quiet with good coffee”. They gave us a tea estate bungalow in Munnar where the caretaker remembered our names by day two. Every detail was already handled.',
    name: 'Divya & Arjun',
    meta: 'Honeymoon · Kerala · 6 days',
    initials: 'DA',
  },
  {
    quote:
      'Pangong at sunrise, with hot chai waiting in the jeep. I’ve done big-bus tours before — this felt like travelling with a friend who happens to know Ladakh inside out.',
    name: 'Karthik R.',
    meta: 'Solo · Ladakh · 7 days',
    initials: 'KR',
  },
  {
    quote:
      'Three generations, one trip, zero arguments. My parents got their palace tour, the kids got a camel ride, and I got a nap by the pool. Worth every rupee.',
    name: 'The Menon family',
    meta: 'Family · Rajasthan · 5 days',
    initials: 'MF',
  },
  {
    quote:
      'Our flight was delayed six hours and they had already re-planned the transfer and moved dinner. I didn’t have to make a single call. That’s the whole review.',
    name: 'Sneha P.',
    meta: 'Friends trip · Bali · 6 days',
    initials: 'SP',
  },
]

export const gallery = [
  { src: kerala, alt: 'Houseboat drifting through Kerala backwaters at golden hour', label: 'Alleppey, Kerala', span: 'tall' },
  { src: ladakh, alt: 'Winding road to Pangong lake in Ladakh', label: 'Pangong, Ladakh', span: '' },
  { src: rajasthan, alt: 'Ornate pink sandstone palace arches in Jaipur', label: 'Jaipur, Rajasthan', span: '' },
  { src: bali, alt: 'Emerald rice terraces in Bali at sunrise', label: 'Ubud, Bali', span: 'wide' },
  { src: andaman, alt: 'Turquoise lagoon and white sand beach in Andaman', label: 'Havelock, Andaman', span: '' },
  { src: himachal, alt: 'Snowy pine forest and mountain road in Himachal', label: 'Solang, Himachal', span: 'tall' },
]

/** The catch-all option used by the form, the rail and the "ask a human" button. */
export const otherTrip = 'Somewhere else entirely'
export const destinationOptions = destinations.map((d) => d.name).concat([otherTrip])

export const footerCols = [
  {
    title: 'Explore',
    links: [
      ['Destinations', '#destinations'],
      ['How we travel', '#way'],
      ['Journey of the month', '#spotlight'],
      ['Postcards', '#postcards'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['Our story', '#story'],
      ['Traveller stories', '#stories'],
      ['Trip planners', '#enquiry'],
      ['Careers', '#enquiry'],
    ],
  },
  {
    title: 'Good to know',
    links: [
      ['Booking & payments', '#enquiry'],
      ['Cancellation policy', '#enquiry'],
      ['Travel insurance', '#enquiry'],
      ['FAQs', '#enquiry'],
    ],
  },
]

export const contact = {
  phone: '+91 90000 12345',
  phoneHref: 'tel:+919000012345',
  whatsapp: 'https://wa.me/919000012345',
  email: 'hello@triptasticholidays.com',
  instagram: 'https://instagram.com',
  address: 'No. 14, Khader Nawaz Khan Road, Nungambakkam, Chennai 600006',
}

/** Shorthand lookups so sections never re-declare a price or a trip length. */
export const trip = (id) => destinations.find((d) => d.id === id)
export const featuredTrip = destinations[0]
export const spotlightTrip = trip('ladakh')

/** The stat shown in the hero strip, testimonials and the story counters. */
export const rating = stats.find((s) => s.label === 'Average trip rating')?.value ?? 4.9
export const yearsRunning = stats.find((s) => s.label === 'Years crafting journeys')?.value ?? 12
export const destinationsCount = stats.find((s) => s.label === 'Destinations curated')?.value ?? 68
