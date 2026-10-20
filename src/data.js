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
    blurb:
      'Sleep on a teal backwater, wake to tea-picker songs in Munnar, end with a candlelit dinner on a quiet beach.',
    highlights: ['Private houseboat', 'Munnar tea estate', 'Ayurveda spa night'],
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
    blurb:
      'Turquoise lakes at 4,300 m, monastery bells in the wind, and the kind of silence that changes your playlist forever.',
    highlights: ['Pangong sunrise', 'Nubra dunes', 'Khardung La drive'],
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
    blurb:
      'Jaipur at golden hour, blue lanes in Jodhpur, and a desert camp where dinner arrives with folk singers.',
    highlights: ['Amber Fort at dawn', 'Thar desert camp', 'Haveli stay'],
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
    blurb:
      'Rice terraces at sunrise, a cliff temple at sunset, and a private villa pool that makes your group chat jealous.',
    highlights: ['Ubud jungle villa', 'Uluwatu kecak dance', 'Nusa Penida boat'],
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
    blurb:
      'Pine air, a wood cabin with a real fireplace, and slow mornings where the only notification is snow falling.',
    highlights: ['Kasol riverside cabin', 'Solang snow day', 'Café trail'],
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
    blurb:
      'Glass-clear lagoons, coral gardens a mask away, and a beach picnic that gets its own drone shot.',
    highlights: ['Havelock lagoon', 'Scuba intro dive', 'Radhanagar sunset'],
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
    blurb:
      'A toy train through tea hills, a colonial bungalow with a fireplace, and mist that rolls in on cue.',
    highlights: ['Mountain rail', 'Tea factory walk', 'Boat house evening'],
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
    blurb:
      'South Goa’s quiet beaches, a Portuguese villa with a courtyard pool, and sunset shacks you won’t want to leave.',
    highlights: ['Villa with pool', 'Sunset cruise', 'Spice farm lunch'],
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

export const destinationOptions = destinations.map((d) => d.name).concat(['Somewhere else entirely'])

export const contact = {
  phone: '+91 90000 12345',
  phoneHref: 'tel:+919000012345',
  whatsapp: 'https://wa.me/919000012345',
  email: 'hello@triptasticholidays.com',
  instagram: 'https://instagram.com',
  address: 'No. 14, Khader Nawaz Khan Road, Nungambakkam, Chennai 600006',
}
