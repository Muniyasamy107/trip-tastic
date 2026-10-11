import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Heart,
  Landmark,
  MapPin,
  Menu,
  Mountain,
  Pause,
  Play,
  Ship,
  Sparkles,
  Trees,
  UsersRound,
  Utensils,
  Waves,
  X,
} from 'lucide-react';
import { createBooking, getDestinations } from './api.js';
import { fallbackDestinations } from './data/destinations.js';

const categories = [
  { name: 'All escapes', icon: Compass, color: 'mango' },
  { name: 'Hill escapes', icon: Mountain, color: 'leaf' },
  { name: 'Backwaters', icon: Ship, color: 'water' },
  { name: 'Heritage & food', icon: Landmark, color: 'chilli' },
  { name: 'Coast & culture', icon: Waves, color: 'pink' },
  { name: 'Wildlife & nature', icon: Trees, color: 'lime' },
];

const categoryFallbacks = {
  Madurai: 'Heritage & food',
  Kodaikanal: 'Hill escapes',
  Munnar: 'Hill escapes',
  'Ooty & the Nilgiris': 'Hill escapes',
  Hampi: 'Heritage & food',
  Puducherry: 'Coast & culture',
  Alleppey: 'Backwaters',
  Coorg: 'Hill escapes',
  Wayanad: 'Wildlife & nature',
  Rameswaram: 'Coast & culture',
};

const FAQs = [
  {
    question: 'Do you only plan trips in South India?',
    answer: 'Yes — the South is our whole map. We focus on Tamil Nadu, Kerala, Karnataka and Puducherry, with local people shaping every route.',
  },
  {
    question: 'Can you change the route to suit my family or group?',
    answer: 'Absolutely. Share your pace, dates, group size and the things you love. Your trip coordinator will shape the stops, stays and small details around you.',
  },
  {
    question: 'Are the prices fixed?',
    answer: 'The prices shown are sample starting estimates in INR. Your final plan depends on dates, stay style and group size; we’ll confirm it with you before anything is booked.',
  },
  {
    question: 'Can I book just one local experience?',
    answer: 'Yes. A food walk in Madurai, a tea trail in Munnar or a backwater afternoon can be a whole lovely trip on its own.',
  },
];

const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

function categoryFor(trip) {
  return trip.category || categoryFallbacks[trip.name] || 'Hill escapes';
}

function priceLabel(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

function responsiveImageUrl(source, width = 1600) {
  try {
    const url = new URL(source);
    const isUnsplash = url.hostname === 'images.unsplash.com';
    const isPexels = url.hostname === 'images.pexels.com';
    if (!isUnsplash && !isPexels) return source;

    const originalWidth = Number(url.searchParams.get('w')) || width;
    const originalHeight = Number(url.searchParams.get('h'));
    url.searchParams.set('w', String(width));
    if (isUnsplash) {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('q', '90');
    } else if (originalHeight) {
      url.searchParams.set('h', String(Math.round(width * originalHeight / originalWidth)));
    }
    return url.toString();
  } catch {
    return source;
  }
}

function responsiveImageSrcSet(source) {
  try {
    const host = new URL(source).hostname;
    if (host !== 'images.unsplash.com' && host !== 'images.pexels.com') return undefined;
    return [160, 320, 480, 640, 960, 1280, 1920]
      .map((width) => `${responsiveImageUrl(source, width)} ${width}w`)
      .join(', ');
  } catch {
    return undefined;
  }
}

function loadSavedTrips() {
  try {
    const stored = JSON.parse(localStorage.getItem('trip-tastic-favourites') || '[]');
    if (!Array.isArray(stored)) return new Set();
    const legacyIds = new Map(fallbackDestinations.filter((trip) => trip.id <= 7).map((trip) => [trip.id, trip.name]));
    const names = stored.map((item) => {
      if (typeof item === 'number' || (typeof item === 'string' && /^[0-9]+$/.test(item))) return legacyIds.get(Number(item));
      return typeof item === 'string' ? item : undefined;
    });
    return new Set(names.filter(Boolean));
  } catch {
    return new Set();
  }
}

function Reveal({ as: Element = 'div', children, className = '', delay = 0, ...props }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      ref={elementRef}
      className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...props}
    >
      {children}
    </Element>
  );
}

function Brand({ light = false }) {
  return (
    <a className={`brand ${light ? 'brand--light' : ''}`} href="#home" aria-label="Trip Tastic Holidays home">
      <img className="brand-logo" src="/trip-tastic-logo.png" alt="" aria-hidden="true" />
      <span className="brand-wording"><strong>Trip <em>Tastic</em></strong><small>HOLIDAYS · SOUTH INDIA</small></span>
    </a>
  );
}

function SiteHeader({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="header-inner">
        <Brand />
        <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`} aria-label="Main navigation">
          <a href="#home" onClick={closeMenu}>Home</a>
          <a href="#about" onClick={closeMenu}>Our South</a>
          <a href="#destinations" onClick={closeMenu}>Places</a>
          <a href="#experiences" onClick={closeMenu}>Experiences</a>
          <a href="#stories" onClick={closeMenu}>Local notes</a>
          <a href="#faq" onClick={closeMenu}>FAQs</a>
          <a className="mobile-plan-link" href="#plan" onClick={closeMenu}>Plan my trip <ArrowUpRight size={15} /></a>
        </nav>
        <a className="header-cta" href="#plan">Plan my trip <ArrowUpRight size={15} /></a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}

function DestinationCard({ trip, index, onExplore, isSaved, onSave }) {
  return (
    <Reveal as="article" className={`destination-card destination-card--${index % 4}`} delay={(index % 3) * 90}>
      <div className="destination-image-wrap">
        <button className="destination-image-button" type="button" onClick={() => onExplore(trip)} aria-label={`Explore ${trip.name}`}>
          <img
            src={responsiveImageUrl(trip.imageUrl, 1280)}
            srcSet={responsiveImageSrcSet(trip.imageUrl)}
            sizes="(max-width: 760px) calc(100vw - 38px), (max-width: 1050px) 43vw, 30vw"
            alt={`${trip.name}, ${trip.country}`}
            loading="lazy"
            decoding="async"
            data-parallax="slow"
          />
          <span className="image-wash" />
        </button>
        <span className="destination-badge"><Sparkles size={12} /> {trip.badge || categoryFor(trip)}</span>
        <button
          className={`save-trip ${isSaved ? 'save-trip--active' : ''}`}
          type="button"
          aria-label={isSaved ? `Remove ${trip.name} from saved trips` : `Save ${trip.name}`}
          aria-pressed={isSaved}
          onClick={() => onSave(trip.name)}
        >
          <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <span className="image-number">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="destination-card-body">
        <div className="destination-card-topline">
          <p className="destination-location"><MapPin size={12} /> {trip.country} <span>·</span> {categoryFor(trip)}</p>
          <span className="destination-rating">★ {Number(trip.rating || 4.8).toFixed(1)}</span>
        </div>
        <button className="destination-title-button" type="button" onClick={() => onExplore(trip)}>
          <h3>{trip.name}</h3><ArrowUpRight size={19} />
        </button>
        <p className="destination-tagline">{trip.tagline}</p>
        <div className="destination-card-footer">
          <span>{trip.duration || 'A few good days'}</span>
          <span>from <strong>{priceLabel(trip.priceFrom)}</strong></span>
        </div>
      </div>
    </Reveal>
  );
}

function TripModal({ trip, onClose, preferences }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('idle');
  const [bookingError, setBookingError] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [form, setForm] = useState(() => ({
    name: '',
    email: '',
    startDate: preferences?.startDate || '',
    travelers: preferences?.travelers || '2',
    notes: '',
  }));

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.classList.add('modal-open');
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBookingError('');
    setBookingStatus('submitting');
    const payload = {
      destinationId: Number(trip.id),
      name: form.name.trim(),
      email: form.email.trim(),
      startDate: form.startDate,
      travelers: Number(form.travelers),
      notes: form.notes.trim(),
    };

    try {
      const result = await createBooking(payload);
      setConfirmation(result?.confirmationCode || `TT-${String(result?.id || 'READY').padStart(5, '0')}`);
      setBookingStatus('success');
    } catch (error) {
      if (error instanceof TypeError || error.apiUnavailable) {
        const localRequest = { ...payload, destination: trip.name, createdAt: new Date().toISOString() };
        try {
          const saved = JSON.parse(localStorage.getItem('trip-tastic-booking-drafts') || '[]');
          localStorage.setItem('trip-tastic-booking-drafts', JSON.stringify([...saved, localRequest]));
        } catch {
          // Preview mode still works if browser storage is disabled.
        }
        setConfirmation('PREVIEW');
        setBookingStatus('preview');
      } else {
        setBookingError(error.message || 'We could not send that just yet. Please try again.');
        setBookingStatus('idle');
      }
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`trip-modal ${bookingOpen ? 'trip-modal--booking' : ''}`} role="dialog" aria-modal="true" aria-labelledby="trip-modal-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close trip details"><X size={20} /></button>
        <div className="modal-photo"><img src={responsiveImageUrl(trip.imageUrl, 1600)} srcSet={responsiveImageSrcSet(trip.imageUrl)} sizes="(max-width: 760px) 100vw, 42vw" alt={`${trip.name} landscape`} decoding="async" /><span className="modal-photo-label"><MapPin size={13} /> {trip.country}, South India</span></div>
        <div className="modal-content">
          {bookingStatus === 'success' || bookingStatus === 'preview' ? (
            <div className="booking-confirmation">
              <span className="confirmation-icon"><Check size={24} /></span>
              <p className="eyebrow">{bookingStatus === 'preview' ? 'A little preview magic' : 'Your next story starts here'}</p>
              <h2 id="trip-modal-title">You’re on your way<br />to <em>{trip.name}.</em></h2>
              <p>{bookingStatus === 'preview' ? 'Your request is saved on this device. Connect the Spring Boot API to send it to your trip coordinator.' : 'Your trip request is with our team. We’ll be in touch soon with the lovely details.'}</p>
              <span className="confirmation-code">{bookingStatus === 'preview' ? 'LOCAL DRAFT' : 'REQUEST'} <strong>{confirmation}</strong></span>
              <button className="button button--dark" type="button" onClick={onClose}>Lovely, thanks <ArrowRight size={17} /></button>
            </div>
          ) : bookingOpen ? (
            <>
              <button className="back-link" type="button" onClick={() => setBookingOpen(false)}><ArrowLeft size={15} /> Back to escape</button>
              <p className="eyebrow">Make it yours · {trip.name}</p>
              <h2 id="trip-modal-title">Let’s get the<br /><em>good bits</em> started.</h2>
              <form className="booking-form" onSubmit={handleSubmit}>
                <label>Your name<input name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder="The name your friends use" required maxLength={100} /></label>
                <label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required maxLength={160} /></label>
                <div className="booking-form-row">
                  <label>Dream departure<input name="startDate" type="date" min={today} value={form.startDate} onChange={handleChange} required /></label>
                  <label>Travellers<select name="travelers" value={form.travelers} onChange={handleChange}>{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => <option key={number} value={number}>{number} {number === 1 ? 'traveller' : 'travellers'}</option>)}</select></label>
                </div>
                <label>A note for us <span className="optional">(optional)</span><textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Anything you’re dreaming of?" rows="2" maxLength={500} /></label>
                {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
                <button className="button button--dark booking-submit" type="submit" disabled={bookingStatus === 'submitting'}>{bookingStatus === 'submitting' ? 'Sending your note…' : 'Send my trip request'} <ArrowRight size={17} /></button>
                <p className="form-note">No commitment, just the first step toward somewhere lovely.</p>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow"><Sparkles size={13} /> {trip.badge || categoryFor(trip)}</p>
              <h2 id="trip-modal-title">{trip.name}<span className="modal-title-dot">.</span></h2>
              <p className="modal-description">{trip.description}</p>
              <div className="trip-facts">
                <div><span>TIME WELL SPENT</span><strong>{trip.duration || 'A few days'}</strong></div>
                <div><span>BEST TIME TO GO</span><strong>{trip.bestTime || 'Whenever you are'}</strong></div>
                <div><span>THOUGHTFUL TRIPS FROM</span><strong>{priceLabel(trip.priceFrom)} <small>/ person</small></strong></div>
              </div>
              <button className="button button--dark modal-book-button" type="button" onClick={() => setBookingOpen(true)}>Ask your trip coordinator <ArrowRight size={17} /></button>
              <p className="modal-footnote"><Compass size={14} /> Made around you, right here in the South.</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function FAQList() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <div className="faq-list">
      {FAQs.map((faq, index) => (
        <article className={`faq-item ${activeIndex === index ? 'faq-item--open' : ''}`} key={faq.question}>
          <button type="button" aria-expanded={activeIndex === index} onClick={() => setActiveIndex((current) => current === index ? -1 : index)}>
            <span className="faq-count">0{index + 1}</span><span>{faq.question}</span><ChevronDown size={18} />
          </button>
          <div className="faq-answer"><p>{faq.answer}</p></div>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const [activeCategory, setActiveCategory] = useState('All escapes');
  const [activeFeaturedId, setActiveFeaturedId] = useState(2);
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [travelerCount, setTravelerCount] = useState('2');
  const [tripPreferences, setTripPreferences] = useState({ startDate: '', travelers: '2' });
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedTrips, setSavedTrips] = useState(loadSavedTrips);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const videoRef = useRef(null);
  const videoProgressRef = useRef(null);
  const scrollProgressRef = useRef(null);
  const journeyFillRef = useRef(null);
  const journeyRef = useRef(null);

  useEffect(() => {
    getDestinations()
      .then((data) => {
        const southOnly = Array.isArray(data) ? data.filter((trip) => trip.region?.toLowerCase() === 'south india') : [];
        if (southOnly.length) setDestinations(southOnly);
      })
      .catch(() => {
        // Keep the South India starter collection visible when the API is offline.
      });
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollProgressRef.current) scrollProgressRef.current.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
        setIsScrolled((current) => {
          const next = window.scrollY > 18;
          return current === next ? current : next;
        });
        if (journeyRef.current && journeyFillRef.current) {
          const rect = journeyRef.current.getBoundingClientRect();
          const start = window.innerHeight * 0.68;
          const end = -rect.height * 0.3;
          const progress = (start - rect.top) / (start - end);
          const bounded = Math.min(1, Math.max(0, progress));
          journeyFillRef.current.style.height = `${bounded * 100}%`;
        }
      });
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const filteredDestinations = useMemo(() => {
    const query = submittedSearch.trim().toLowerCase();
    return destinations.filter((trip) => {
      const matchesCategory = activeCategory === 'All escapes' || categoryFor(trip) === activeCategory;
      const matchesQuery = !query || [trip.name, trip.country, trip.region, trip.tagline, categoryFor(trip)].some((value) => value?.toLowerCase().includes(query));
      const matchesSaved = !showSavedOnly || savedTrips.has(trip.name);
      return matchesCategory && matchesQuery && matchesSaved && trip.region?.toLowerCase() === 'south india';
    });
  }, [activeCategory, destinations, savedTrips, showSavedOnly, submittedSearch]);

  const featuredTrip = filteredDestinations.find((trip) => trip.id === activeFeaturedId) || filteredDestinations[0] || null;
  const tripSelectors = filteredDestinations.slice(0, 7);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    setSubmittedSearch(query);
    setTripPreferences({ startDate: tripDate, travelers: travelerCount });
    setActiveCategory('All escapes');
    setIsSearching(true);
    if (query) {
      try {
        const results = await getDestinations(query);
        const southOnly = Array.isArray(results) ? results.filter((trip) => trip.region?.toLowerCase() === 'south india') : [];
        setDestinations(southOnly);
      } catch {
        // Restore the local collection so another search is not limited by a previous API result.
        setDestinations(fallbackDestinations);
      }
    } else {
      try {
        const results = await getDestinations();
        if (Array.isArray(results) && results.length) setDestinations(results.filter((trip) => trip.region?.toLowerCase() === 'south india'));
        else setDestinations(fallbackDestinations);
      } catch {
        setDestinations(fallbackDestinations);
      }
    }
    setIsSearching(false);
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearSearch = async () => {
    setSubmittedSearch('');
    setSearchInput('');
    setActiveCategory('All escapes');
    setShowSavedOnly(false);
    setDestinations(fallbackDestinations);
    try {
      const results = await getDestinations();
      if (Array.isArray(results) && results.length) setDestinations(results.filter((trip) => trip.region?.toLowerCase() === 'south india'));
    } catch {
      setDestinations(fallbackDestinations);
    }
  };

  const toggleSaved = (name) => {
    setSavedTrips((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      try {
        localStorage.setItem('trip-tastic-favourites', JSON.stringify([...next]));
      } catch {
        // Favourites still work for this visit if storage is unavailable.
      }
      return next;
    });
  };

  const toggleHeroVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setIsHeroVideoPlaying(false));
    else video.pause();
  };

  const updateVideoProgress = (event) => {
    const video = event.currentTarget;
    if (videoProgressRef.current && Number.isFinite(video.duration) && video.duration > 0) {
      videoProgressRef.current.style.width = `${(video.currentTime / video.duration) * 100}%`;
    }
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    setSubmittedSearch('');
    setSearchInput('');
    setTimeout(() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  };

  const handleNewsletter = (event) => {
    event.preventDefault();
    const email = newsletterEmail.trim().toLowerCase();
    if (!email) return;

    try {
      const savedEmails = JSON.parse(localStorage.getItem('trip-tastic-newsletter') || '[]');
      const subscriptions = Array.isArray(savedEmails) ? savedEmails : [];
      if (subscriptions.includes(email)) {
        setNewsletterMessage('You’re already on this device’s postcard list.');
        return;
      }
      localStorage.setItem('trip-tastic-newsletter', JSON.stringify([...subscriptions, email]));
      setNewsletterMessage('Saved on this device for the preview. A mailing-list service can be connected later.');
      setNewsletterEmail('');
    } catch {
      setNewsletterMessage('Browser storage is unavailable, so your email was not saved.');
    }
  };

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const parallaxImages = [...document.querySelectorAll('[data-parallax="slow"]')];
    if (!parallaxImages.length) return undefined;

    let frame = 0;
    const updateParallax = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const viewportCenter = window.innerHeight / 2;
        for (const image of parallaxImages) {
          const rect = image.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
          const distance = rect.top + rect.height / 2 - viewportCenter;
          const offset = Math.max(-18, Math.min(18, -distance * 0.035));
          image.style.setProperty('--parallax-offset', `${offset.toFixed(1)}px`);
        }
      });
    };

    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, [filteredDestinations, prefersReducedMotion]);

  return (
    <>
      <div ref={scrollProgressRef} className="scroll-progress" aria-hidden="true" />
      <SiteHeader scrolled={isScrolled} />
      <main>
        <section className="hero" id="home">
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay={!prefersReducedMotion}
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1920&h=1080&dpr=1"
            aria-label="A Land Rover Defender on a muddy off-road trail"
            onPlay={() => setIsHeroVideoPlaying(true)}
            onPause={() => setIsHeroVideoPlaying(false)}
            onTimeUpdate={updateVideoProgress}
          >
            <source src="https://videos.pexels.com/video-files/30245559/12966487_1920_1080_120fps.mp4" type="video/mp4" />
            <img src="https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1920&h=1080&dpr=1" srcSet="https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=960&h=540&dpr=1 960w, https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1600&h=900&dpr=1 1600w, https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1920&h=1080&dpr=1 1920w" sizes="100vw" alt="Land Rover crossing a muddy trail" />
          </video>
          <div className="hero-tint" />
          <div className="hero-dust" aria-hidden="true" />
          <div className="hero-topline page-width"><span className="live-badge"><i /> THE SOUTH, UNPACKED</span><span className="hero-index">01 <i /> 10 SOUTH INDIAN ESCAPES</span></div>
          <div className="page-width hero-main">
            <Reveal className="hero-copy">
              <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> YOUR LOCAL TRIP COORDINATOR</p>
              <h1>South India.<br /><em>Unscripted.</em></h1>
              <p className="hero-description">Temple bells. Tea trails. Backwater mornings. We’ll take you past the obvious and into the South that stays with you.</p>
              <div className="hero-actions">
                <a className="button button--mango" href="#destinations">Explore the South <ArrowUpRight size={17} /></a>
                <a className="hero-text-link" href="#about"><span><ArrowDown size={14} /></span> Our kind of travel</a>
              </div>
              <div className="hero-route-pill"><span className="route-pulse" /> MADURAI <i /> KODAIKANAL <i /> MUNNAR <span className="route-pill-note">· ONE VERY GOOD ROUTE</span></div>
            </Reveal>
          </div>
          <div className="hero-bottomline page-width">
            <div className="hero-film-note"><span className="film-icon"><Compass size={15} /></span><span><strong>DEFENDER 4×4 · OFF-ROAD MODE</strong><small>Take the long way. We’ll plan the good stops.</small></span></div>
            <div className="hero-video-controls">
              <button type="button" onClick={toggleHeroVideo} aria-label={isHeroVideoPlaying ? 'Pause hero video' : 'Play hero video'}>{isHeroVideoPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</button>
              <div className="video-progress-track"><span ref={videoProgressRef} /></div>
              <span>{isHeroVideoPlaying ? 'PLAYING' : 'PAUSED'}</span>
            </div>
            <a className="hero-scroll-cue" href="#about">SCROLL TO FIND YOUR SOUTH <ArrowDown size={14} /></a>
          </div>
          <a className="hero-video-credit" href="https://www.pexels.com/video/off-road-adventure-land-rover-in-muddy-terrain-30245559/" target="_blank" rel="noreferrer">VIDEO: HARVEY TAN VILLARINO / PEXELS</a>
          <div className="hero-corner-stamp"><span>LOCAL</span><span>LOVED</span><span>DOWN SOUTH</span></div>
        </section>

        <div className="marquee-strip" aria-label="South India, your way">
          <div className="marquee-track"><span>NO PASSPORT NEEDED</span><i>✳</i><span>LOCAL PEOPLE, LOCAL PLACES</span><i>✳</i><span>TAKE THE SLOW ROAD</span><i>✳</i><span>SOUTH INDIA ONLY</span><i>✳</i><span>NO PASSPORT NEEDED</span><i>✳</i><span>LOCAL PEOPLE, LOCAL PLACES</span><i>✳</i><span>TAKE THE SLOW ROAD</span><i>✳</i><span>SOUTH INDIA ONLY</span><i>✳</i></div>
        </div>

        <section className="search-section" id="trip-search" aria-label="Plan a South India escape">
          <div className="page-width">
            <form className="trip-search" onSubmit={handleSearch}>
              <div className="search-heading">
                <span className="search-spark"><Compass size={17} /></span>
                <span>YOUR NEXT GOOD THING<br /><strong>Starts right here.</strong></span>
              </div>
              <label className="search-field search-location">
                <span><MapPin size={12} /> FIND YOUR SOUTH</span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Munnar, Madurai, Kerala…"
                  list="south-india-places"
                  aria-label="Search South India destinations"
                />
              </label>
              <label className="search-field search-date">
                <span><CalendarDays size={12} /> WHEN’S THE ESCAPE?</span>
                <input type="date" min={today} value={tripDate} onChange={(event) => setTripDate(event.target.value)} aria-label="Preferred departure date" />
              </label>
              <label className="search-field search-travellers">
                <span><UsersRound size={12} /> TRAVELLERS</span>
                <select value={travelerCount} onChange={(event) => setTravelerCount(event.target.value)} aria-label="Number of travellers">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((number) => <option key={number} value={number}>{number} {number === 1 ? 'traveller' : 'travellers'}</option>)}
                </select>
              </label>
              <button className="search-submit" type="submit" aria-label="Search trips" disabled={isSearching}>
                {isSearching ? <span className="button-loader" /> : <ArrowRight size={19} />}
              </button>
            </form>
            <datalist id="south-india-places">
              {destinations.map((trip) => <option key={trip.id} value={trip.name} />)}
            </datalist>
          </div>
        </section>

        <section className="welcome-section" id="about">
          <div className="page-width welcome-layout">
            <Reveal className="welcome-copy">
              <p className="eyebrow"><span className="eyebrow-dot" /> VANAKKAM · WELCOME TO OUR SOUTH</p>
              <span className="welcome-watermark" aria-hidden="true">WELCOME</span>
              <h2>Not a checklist.<br /><em>A feeling.</em></h2>
              <p>We believe the best trips happen when you stop chasing every landmark. Meet the makers, taste the local favourite, stay one more night. That’s our South India.</p>
              <a className="text-arrow" href="#how-it-works">Get to know our way <ArrowRight size={16} /></a>
              <div className="welcome-stats"><span><strong>10</strong><small>handpicked South escapes</small></span><i /><span><strong>1:1</strong><small>trip planning around you</small></span></div>
            </Reveal>
            <div className="welcome-gallery">
              <Reveal className="welcome-photo welcome-photo--hill" delay={110}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1707655315272-33a54a771068?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1707655315272-33a54a771068?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 90vw, 46vw" alt="A train winding through the green Nilgiri hills" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="photo-tag photo-tag--yellow">THE NILGIRIS · TAKE IT SLOW</span>
              </Reveal>
              <Reveal className="welcome-photo welcome-photo--water" delay={220}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 90vw, 40vw" alt="A boat gliding through Kerala backwaters" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="photo-tag photo-tag--green">KERALA · GO WITH THE FLOW</span>
              </Reveal>
              <div className="gallery-scribble" aria-hidden="true">south<br />is a feeling<span>✳</span></div>
              <span className="gallery-coordinate">10° 05′ N · 77° 03′ E</span>
            </div>
          </div>
        </section>

        <section className="destinations-section" id="destinations">
          <div className="page-width">
            <div className="section-heading-row">
              <Reveal className="section-heading-copy">
                <p className="eyebrow"><span className="eyebrow-dot" /> TRENDING ESCAPES · SOUTH INDIA ONLY</p>
                <h2>Pick your kind<br />of <em>South.</em></h2>
              </Reveal>
              <Reveal className="section-heading-note" delay={120}>
                <span className="hand-arrow">↙</span>
                <p>Hill air, temple towns, blue-water days and routes made for your pace.</p>
                <span className="route-count">{filteredDestinations.length.toString().padStart(2, '0')} places to begin</span>
              </Reveal>
            </div>

            <div className="category-selector" role="group" aria-label="Filter South India trips">
              {categories.map(({ name, icon: Icon, color }) => (
                <button key={name} className={`category-tab ${activeCategory === name ? 'category-tab--active' : ''}`} type="button" aria-pressed={activeCategory === name} onClick={() => selectCategory(name)}>
                  <span className={`category-icon category-icon--${color}`}><Icon size={18} strokeWidth={1.8} /></span><span>{name}</span>
                </button>
              ))}
              <button className={`category-tab category-tab--saved ${showSavedOnly ? 'category-tab--active' : ''}`} type="button" aria-pressed={showSavedOnly} aria-label={`Filter by saved trips, ${savedTrips.size} saved`} onClick={() => setShowSavedOnly((current) => !current)}>
                <span className="category-icon category-icon--saved"><Heart size={17} fill={showSavedOnly ? 'currentColor' : 'none'} /></span><span>Saved trips <b>{savedTrips.size}</b></span>
              </button>
            </div>

            {submittedSearch && <button className="clear-search" type="button" onClick={clearSearch}>Clear “{submittedSearch}” <X size={13} /></button>}

            {featuredTrip ? (
              <Reveal className="featured-escape" delay={60}>
                <div className="featured-image">
                  <img src={responsiveImageUrl(featuredTrip.imageUrl, 1600)} srcSet={responsiveImageSrcSet(featuredTrip.imageUrl)} sizes="(max-width: 760px) 100vw, 54vw" alt={`${featuredTrip.name} in ${featuredTrip.country}`} loading="lazy" decoding="async" data-parallax="slow" />
                  <button className={`save-trip featured-save-trip ${savedTrips.has(featuredTrip.name) ? 'save-trip--active' : ''}`} type="button" aria-label={savedTrips.has(featuredTrip.name) ? `Remove ${featuredTrip.name} from saved trips` : `Save ${featuredTrip.name}`} aria-pressed={savedTrips.has(featuredTrip.name)} onClick={() => toggleSaved(featuredTrip.name)}><Heart size={18} fill={savedTrips.has(featuredTrip.name) ? 'currentColor' : 'none'} /></button>
                  <div className="featured-image-shade" />
                  <span className="featured-season"><Sparkles size={13} /> {featuredTrip.badge || categoryFor(featuredTrip)}</span>
                  <span className="featured-location"><MapPin size={14} /> {featuredTrip.name} · {featuredTrip.country}</span>
                  <span className="featured-image-index">0{Math.max(1, destinations.findIndex((trip) => trip.id === featuredTrip.id) + 1)}</span>
                  <span className="image-orbit image-orbit--one" /><span className="image-orbit image-orbit--two" />
                </div>
                <div className="featured-copy">
                  <p className="eyebrow"><span className="eyebrow-dot" /> {categoryFor(featuredTrip).toUpperCase()} · MADE PERSONAL</p>
                  <h3>{featuredTrip.name}<span>.</span></h3>
                  <p className="featured-tagline">{featuredTrip.tagline}</p>
                  <p className="featured-description">{featuredTrip.description}</p>
                  <div className="featured-facts"><span><CalendarDays size={15} /> {featuredTrip.duration}</span><span><Sparkles size={15} /> Best: {featuredTrip.bestTime}</span><span><MapPin size={15} /> {featuredTrip.country}</span></div>
                  <div className="featured-price-row"><span>THOUGHTFUL TRIPS FROM <strong>{priceLabel(featuredTrip.priceFrom)}</strong> <small>/ person</small></span><button className="button button--dark" type="button" onClick={() => setSelectedTrip(featuredTrip)}>Explore this escape <ArrowRight size={17} /></button></div>
                  <div className="featured-selector" role="tablist" aria-label="Choose a featured South India destination">
                    {tripSelectors.map((trip) => (
                      <button key={trip.id} className={`destination-selector ${trip.id === featuredTrip.id ? 'destination-selector--active' : ''}`} type="button" role="tab" aria-selected={trip.id === featuredTrip.id} aria-label={`Show ${trip.name}`} onClick={() => setActiveFeaturedId(trip.id)}>
                        <img src={responsiveImageUrl(trip.imageUrl, 320)} srcSet={responsiveImageSrcSet(trip.imageUrl)} sizes="28px" alt="" loading="lazy" decoding="async" /><span>{trip.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>
            ) : (
              <div className="empty-results"><span>{showSavedOnly ? <Heart size={24} /> : <Compass size={26} />}</span><h3>{showSavedOnly ? 'Your saved collection is taking shape.' : 'That little corner is still a secret.'}</h3><p>{showSavedOnly ? 'Tap the heart on any escape to keep it close for later.' : 'Try another South Indian place or experience.'}</p><button className="button button--dark" type="button" onClick={clearSearch}>Show me the South <ArrowRight size={16} /></button></div>
            )}

            {filteredDestinations.length > 1 && (
              <div className="destination-grid">
                {filteredDestinations.filter((trip) => trip.id !== featuredTrip?.id).map((trip, index) => (
                  <DestinationCard key={trip.id} trip={trip} index={index} onExplore={setSelectedTrip} isSaved={savedTrips.has(trip.name)} onSave={toggleSaved} />
                ))}
              </div>
            )}
            <div className="destinations-footnote"><span className="tiny-sun">✳</span><span>Only the South. All of its many moods.</span></div>
          </div>
        </section>

        <section className="moods-section" id="experiences">
          <div className="page-width">
            <div className="moods-heading">
              <Reveal><p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> TAKE THE SCENIC ROUTE</p><h2>Go by what<br />moves <em>you.</em></h2></Reveal>
              <Reveal delay={100}><p>Pick a feeling. Your trip coordinator will find the places, people and little moments that fit.</p></Reveal>
            </div>
            <div className="moods-grid">
              <button className="mood-card mood-card--hills" type="button" onClick={() => selectCategory('Hill escapes')}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1665481193520-86e5eaba1af6?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1665481193520-86e5eaba1af6?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 50vw, 25vw" alt="Green hills at Kodaikanal" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="mood-number">01</span><span className="mood-icon"><Mountain size={20} /></span><span className="mood-card-copy"><small>FOR THE FRESH-AIR SEEKERS</small><strong>Hill days</strong><i>Tea trails, train rides & misty starts</i></span><ArrowUpRight className="mood-arrow" size={22} />
              </button>
              <button className="mood-card mood-card--water" type="button" onClick={() => selectCategory('Backwaters')}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 50vw, 25vw" alt="Kerala's backwaters" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="mood-number">02</span><span className="mood-icon"><Ship size={20} /></span><span className="mood-card-copy"><small>FOR THE SLOW-DOWN PEOPLE</small><strong>Water ways</strong><i>Quiet canals & long lunches</i></span><ArrowUpRight className="mood-arrow" size={22} />
              </button>
              <button className="mood-card mood-card--heritage" type="button" onClick={() => selectCategory('Heritage & food')}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1596018382916-56d2e341d784?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1596018382916-56d2e341d784?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 50vw, 25vw" alt="Ancient stone ruins at Hampi" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="mood-number">03</span><span className="mood-icon"><Utensils size={20} /></span><span className="mood-card-copy"><small>FOR THE CURIOUS ONES</small><strong>Culture & flavour</strong><i>Old streets, local kitchens & stories</i></span><ArrowUpRight className="mood-arrow" size={22} />
              </button>
              <button className="mood-card mood-card--coast" type="button" onClick={() => selectCategory('Coast & culture')}>
                <img src={responsiveImageUrl('https://images.unsplash.com/photo-1677951221673-09be408d2ddf?auto=format&fit=crop&w=1600&q=90', 1600)} srcSet={responsiveImageSrcSet('https://images.unsplash.com/photo-1677951221673-09be408d2ddf?auto=format&fit=crop&w=1600&q=90')} sizes="(max-width: 760px) 50vw, 25vw" alt="Colorful street in Puducherry" loading="lazy" decoding="async" data-parallax="slow" />
                <span className="mood-number">04</span><span className="mood-icon"><Waves size={20} /></span><span className="mood-card-copy"><small>FOR THE BLUE-HOUR CHASERS</small><strong>Coastal days</strong><i>Pastel lanes, sea breeze & no rush</i></span><ArrowUpRight className="mood-arrow" size={22} />
              </button>
            </div>
          </div>
        </section>

        <section className="how-section" id="how-it-works" ref={journeyRef}>
          <div className="how-decoration how-decoration--one" aria-hidden="true" /><div className="how-decoration how-decoration--two" aria-hidden="true" />
          <div className="page-width how-layout">
            <div className="how-copy">
              <Reveal>
                <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> YOUR TRIP, THOUGHT THROUGH</p>
                <h2>Good plans.<br /><em>Open roads.</em></h2>
                <p>Local know-how, a little wiggle room and someone to sort the details. That’s how your South India story comes together.</p>
                <a className="button button--mango" href="#plan">Meet your trip coordinator <ArrowUpRight size={16} /></a>
                <span className="how-coordinate">10° 05′ N<br />77° 03′ E</span>
              </Reveal>
            </div>
            <div className="steps-column">
              <div className="journey-route" aria-hidden="true"><span ref={journeyFillRef} /><i className="route-dot route-dot--one" /><i className="route-dot route-dot--two" /><i className="route-dot route-dot--three" /></div>
              <Reveal as="article" className="journey-step"><span className="step-number">01</span><div><small>FIRST, WE LISTEN</small><h3>Your kind of <em>trip.</em></h3><p>Dates, chai breaks, tiny travellers or a very big appetite—we start with what matters to you.</p></div><span className="step-doodle">↗</span></Reveal>
              <Reveal as="article" className="journey-step" delay={110}><span className="step-number">02</span><div><small>THEN, WE CONNECT THE DOTS</small><h3>Local, not <em>ordinary.</em></h3><p>Our trip coordinator lines up local stays, trusted hosts and the roads less hurried.</p></div><span className="step-doodle">✳</span></Reveal>
              <Reveal as="article" className="journey-step" delay={220}><span className="step-number">03</span><div><small>FINALLY, YOU GO</small><h3>Bring home a <em>story.</em></h3><p>We keep the details light, so you can be there for the temple bells, the tea and everything between.</p></div><span className="step-doodle">♡</span></Reveal>
            </div>
          </div>
          <div className="how-bottom-line"><span>MADE AROUND YOU</span><i /><span>ROOTED IN THE SOUTH</span><i /><span>READY FOR THE LONG WAY</span></div>
        </section>

        <section className="route-feature page-width">
          <Reveal className="route-feature-photo">
            <img src="https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=1920&h=1143&dpr=1" srcSet="https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=640&h=381&dpr=1 640w, https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=960&h=572&dpr=1 960w, https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=1280&h=762&dpr=1 1280w, https://images.pexels.com/videos/35530760/bus-window-view-calming-scenery-cinematic-travel-countryside-india-35530760.jpeg?auto=compress&w=1920&h=1143&dpr=1 1920w" sizes="100vw" alt="The winding green tea roads of Munnar" loading="lazy" decoding="async" data-parallax="slow" />
            <div className="route-photo-overlay" />
            <span className="route-feature-label"><span className="film-live-dot" /> THE SLOW ROAD SERIES · 01</span>
            <span className="route-feature-caption">A road through<br /><em>the Western Ghats.</em></span>
            <span className="route-photo-coordinates">MUNNAR · KERALA</span>
          </Reveal>
          <Reveal className="route-feature-copy" delay={130}>
            <p className="eyebrow"><span className="eyebrow-dot" /> A LITTLE INSPIRATION FOR YOUR NEXT ESCAPE</p>
            <h2>Somewhere between<br />the <em>map and the moment.</em></h2>
            <p>Follow a tea trail, take the scenic detour and leave enough room for the chai stop you didn’t know you needed. We’ll help you find the route.</p>
            <a className="text-arrow" href="#destinations" onClick={() => selectCategory('Hill escapes')}>Find your hill escape <ArrowRight size={16} /></a>
          </Reveal>
        </section>

        <section className="stories-section" id="stories">
          <div className="page-width">
            <div className="section-heading-row stories-heading">
              <Reveal className="section-heading-copy"><p className="eyebrow"><span className="eyebrow-dot" /> NOTES FROM THE SOUTH</p><h2>Little things<br />worth <em>knowing.</em></h2></Reveal>
              <Reveal className="section-heading-note" delay={100}><p>Local notes for curious travellers. Start with the story, then make it your own.</p><a className="text-arrow" href="#destinations">See every escape <ArrowRight size={15} /></a></Reveal>
            </div>
            <div className="stories-grid">
              <Reveal as="article" className="story-card story-card--one"><span className="story-tag">MADURAI · CULTURE</span><h3>How to spend a morning<br />around the flower market.</h3><span className="story-read">A LOCAL NOTE · 4 MIN READ</span></Reveal>
              <Reveal as="article" className="story-card story-card--two" delay={100}><span className="story-tag">KERALA · SLOW TRAVEL</span><h3>Backwater days are<br />better without a clock.</h3><span className="story-read">A LOCAL NOTE · 3 MIN READ</span></Reveal>
              <Reveal as="article" className="story-card story-card--three" delay={200}><span className="story-tag">NILGIRIS · HILL LIFE</span><h3>Take the toy train.<br />Take the window seat.</h3><span className="story-read">A LOCAL NOTE · 5 MIN READ</span></Reveal>
            </div>
          </div>
        </section>

        <section className="quote-section page-width">
          <Reveal className="quote-decoration" aria-hidden="true">“</Reveal>
          <Reveal className="quote-content" delay={100}>
            <p className="eyebrow"><span className="eyebrow-dot" /> A NOTE FROM THE ROAD</p>
            <blockquote>“The best bit wasn’t one place. It was how unhurried the whole trip felt.”</blockquote>
            <div className="quote-attribution"><span className="quote-avatar">M</span><span><strong>Maya R.</strong><small>South India trip · sample traveller note</small></span><span className="quote-stars">★★★★★</span></div>
          </Reveal>
          <div className="quote-side-note">GO SLOW.<br />SEE MORE. <span>↙</span></div>
        </section>

        <section className="faq-section" id="faq">
          <div className="page-width faq-layout">
            <Reveal className="faq-heading"><p className="eyebrow"><span className="eyebrow-dot" /> THE LITTLE DETAILS</p><h2>A few good<br /><em>questions.</em></h2><p>Still wondering about something? Browse an escape and tell us what you have in mind.</p><a className="text-arrow" href="#destinations">Find your South <ArrowUpRight size={15} /></a></Reveal>
            <Reveal className="faq-content" delay={120}><FAQList /></Reveal>
          </div>
        </section>

        <section className="plan-section" id="plan">
          <div className="plan-image" aria-hidden="true" />
          <div className="plan-overlay" />
          <Reveal className="plan-content page-width">
            <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> ONE GOOD HELLO IS ALL IT TAKES</p>
            <h2>Ready to take<br />the <em>long way?</em></h2>
            <p>Tell us what you’re dreaming of. We’ll meet you somewhere lovely in the South.</p>
            <a className="button button--mango" href="#trip-search">Start planning <ArrowUpRight size={17} /></a>
            <span className="plan-scribble" aria-hidden="true">✳</span>
          </Reveal>
          <span className="plan-credit">A LITTLE SOMEWHERE IN KERALA · SOUTH INDIA</span>
        </section>

        <section className="newsletter-section">
          <div className="page-width newsletter-layout">
            <div><p className="eyebrow"><span className="eyebrow-dot" /> A POSTCARD, ONCE IN A WHILE</p><h2>Good places.<br /><em>Good notes.</em></h2><p className="newsletter-description">South India stories, small local finds and the occasional reason to take a Friday off.</p></div>
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <label className="sr-only" htmlFor="newsletter-email">Email address</label>
              <input id="newsletter-email" type="email" value={newsletterEmail} onChange={(event) => setNewsletterEmail(event.target.value)} placeholder="Your email address" required />
              <button type="submit" aria-label="Subscribe to South India postcards"><ArrowRight size={18} /></button>
              <p aria-live="polite">{newsletterMessage || 'Preview sign-ups are saved on this device only.'}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-top">
          <div className="footer-brand-column"><Brand light /><p>Small trips. Big feelings.<br />That’s the whole idea.</p></div>
          <div className="footer-links"><span>FIND YOUR SOUTH</span><a href="#destinations">Hill escapes</a><a href="#destinations">Backwaters</a><a href="#destinations">Heritage & food</a><a href="#destinations">Coast & culture</a></div>
          <div className="footer-note"><span>A LITTLE NOTE FROM US</span><p>Made for people who’d rather remember how a place felt than how many things they saw.</p><a href="#trip-search">Start planning <ArrowUpRight size={14} /></a></div>
          <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUpRight size={19} /></a>
        </div>
        <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} TRIP TASTIC · SOUTH INDIA ONLY</span><span>GO WELL. COME BACK DIFFERENT.</span></div>
      </footer>

      {selectedTrip && <TripModal trip={selectedTrip} preferences={tripPreferences} onClose={() => setSelectedTrip(null)} />}
    </>
  );
}
