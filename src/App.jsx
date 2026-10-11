import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  Globe2,
  Heart,
  MapPin,
  Menu,
  Pause,
  Play,
  Sparkles,
  UsersRound,
  X,
} from 'lucide-react';
import { createBooking, getDestinations } from './api.js';
import { fallbackDestinations } from './data/destinations.js';

const regions = ['South India', 'All places', 'Asia', 'Europe', 'Americas', 'Africa'];

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
    <a className={`brand ${light ? 'brand--light' : ''}`} href="#home" aria-label="Trip Tastic home">
      <span className="brand-mark" aria-hidden="true"><Compass size={20} strokeWidth={2.3} /></span>
      <span>trip<span className="brand-tastic">tastic</span><span className="brand-period">.</span></span>
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
          <a href="#destinations" onClick={closeMenu}>Find your somewhere</a>
          <a href="#our-way" onClick={closeMenu}>Our kind of travel</a>
          <a href="#about" onClick={closeMenu}>The good stuff</a>
          <a className="mobile-plan-link" href="#trip-search" onClick={closeMenu}>Plan a trip <ArrowUpRight size={16} /></a>
        </nav>
        <a className="header-cta" href="#trip-search">Plan a trip <ArrowUpRight size={15} /></a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
    </header>
  );
}

function DestinationCard({ trip, index, onExplore, isSaved, onSave }) {
  return (
    <Reveal as="article" className={`destination-card destination-card--${index + 1}`} delay={index * 100}>
      <div className="destination-image-wrap">
        <button className="destination-image-button" type="button" onClick={() => onExplore(trip)} aria-label={`Explore ${trip.name}`}>
          <img src={trip.imageUrl} alt={`${trip.name}, ${trip.country}`} loading="lazy" />
          <span className="image-wash" />
        </button>
        <span className="destination-badge"><Sparkles size={12} /> {trip.badge || 'A Trip Tastic favourite'}</span>
        <button
          className={`save-trip ${isSaved ? 'save-trip--active' : ''}`}
          type="button"
          aria-label={isSaved ? `Remove ${trip.name} from saved trips` : `Save ${trip.name}`}
          aria-pressed={isSaved}
          onClick={() => onSave(trip.id)}
        >
          <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <span className="image-number">0{index + 1}</span>
      </div>
      <div className="destination-card-body">
        <div className="destination-card-topline">
          <p className="destination-location"><MapPin size={12} /> {trip.country} <span>·</span> {trip.region}</p>
          <span className="destination-rating">★ {Number(trip.rating || 4.8).toFixed(1)}</span>
        </div>
        <button className="destination-title-button" type="button" onClick={() => onExplore(trip)}>
          <h3>{trip.name}</h3><ArrowUpRight size={19} />
        </button>
        <p className="destination-tagline">{trip.tagline}</p>
        <div className="destination-card-footer">
          <span>{trip.duration || 'A few good days'}</span>
          <span>from <strong>₹{Number(trip.priceFrom || 0).toLocaleString('en-IN')}</strong></span>
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
  const today = new Date().toISOString().slice(0, 10);

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
          // Private browsing can disable local storage; the preview confirmation still works.
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
        <div className="modal-photo">
          <img src={trip.imageUrl} alt={`${trip.name} landscape`} />
          <span className="modal-photo-label"><MapPin size={13} /> {trip.country}</span>
        </div>
        <div className="modal-content">
          {bookingStatus === 'success' || bookingStatus === 'preview' ? (
            <div className="booking-confirmation">
              <span className="confirmation-icon"><Check size={24} /></span>
              <p className="eyebrow">{bookingStatus === 'preview' ? 'A little preview magic' : 'Your next story starts here'}</p>
              <h2 id="trip-modal-title">You’re on your way<br />to <em>{trip.name}.</em></h2>
              <p>{bookingStatus === 'preview'
                ? 'Your request is saved on this device. Connect the Spring Boot API to send it to your trip team.'
                : 'Your trip request is with our team. We’ll be in touch soon with the lovely details.'}</p>
              <span className="confirmation-code">{bookingStatus === 'preview' ? 'LOCAL DRAFT' : 'REQUEST'} <strong>{confirmation}</strong></span>
              <button className="button button--dark" type="button" onClick={onClose}>Lovely, thanks <ArrowRight size={17} /></button>
            </div>
          ) : bookingOpen ? (
            <>
              <button className="back-link" type="button" onClick={() => setBookingOpen(false)}><ArrowRight size={15} /> Back to trip</button>
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
                <button className="button button--dark booking-submit" type="submit" disabled={bookingStatus === 'submitting'}>
                  {bookingStatus === 'submitting' ? 'Sending your note…' : 'Send my trip request'} <ArrowRight size={17} />
                </button>
                <p className="form-note">No commitment, just the first step toward somewhere lovely.</p>
              </form>
            </>
          ) : (
            <>
              <p className="eyebrow"><Sparkles size={13} /> {trip.badge || 'Picked with feeling'}</p>
              <h2 id="trip-modal-title">{trip.name}<span className="modal-title-dot">.</span></h2>
              <p className="modal-description">{trip.description}</p>
              <div className="trip-facts">
                <div><span>TIME WELL SPENT</span><strong>{trip.duration || 'A few days'}</strong></div>
                <div><span>BEST TIME TO GO</span><strong>{trip.bestTime || 'Whenever you are'}</strong></div>
                <div><span>THOUGHTFUL TRIPS FROM</span><strong>₹{Number(trip.priceFrom || 0).toLocaleString('en-IN')} <small>/ person</small></strong></div>
              </div>
              <button className="button button--dark modal-book-button" type="button" onClick={() => setBookingOpen(true)}>Start planning <ArrowRight size={17} /></button>
              <p className="modal-footnote"><Globe2 size={14} /> Good trips, made around you.</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [destinations, setDestinations] = useState(fallbackDestinations);
  const [activeFilter, setActiveFilter] = useState('South India');
  const [searchInput, setSearchInput] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [tripDate, setTripDate] = useState('');
  const [travelerCount, setTravelerCount] = useState('2');
  const [tripPreferences, setTripPreferences] = useState({ startDate: '', travelers: '2' });
  const [isSearching, setIsSearching] = useState(false);
  const [isHeroVideoPlaying, setIsHeroVideoPlaying] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [savedTrips, setSavedTrips] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('trip-tastic-favourites') || '[]'));
    } catch {
      return new Set();
    }
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollProgressRef = useRef(null);
  const journeyFillRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroVideoProgressRef = useRef(null);
  const journeyRef = useRef(null);

  useEffect(() => {
    getDestinations()
      .then((data) => {
        if (Array.isArray(data) && data.length) setDestinations(data);
      })
      .catch(() => {
        // Keep the curated local set visible while the API is offline or still being configured.
      });
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        if (scrollProgressRef.current) scrollProgressRef.current.style.transform = `scaleX(${progress})`;
        setIsScrolled((current) => {
          const next = window.scrollY > 18;
          return current === next ? current : next;
        });
        if (heroImageRef.current) {
          heroImageRef.current.style.setProperty('--parallax-y', `${Math.min(window.scrollY * 0.08, 48)}px`);
        }
        if (journeyRef.current && journeyFillRef.current) {
          const rect = journeyRef.current.getBoundingClientRect();
          const start = window.innerHeight * 0.68;
          const end = -rect.height * 0.28;
          const journeyProgress = (start - rect.top) / (start - end);
          journeyFillRef.current.style.height = `${Math.min(1, Math.max(0, journeyProgress)) * 100}%`;
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
      const matchesRegion = activeFilter === 'All places' || trip.region?.toLowerCase() === activeFilter.toLowerCase();
      const matchesQuery = !query || [trip.name, trip.country, trip.region, trip.tagline].some((value) => value?.toLowerCase().includes(query));
      return matchesRegion && matchesQuery;
    });
  }, [activeFilter, destinations, submittedSearch]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const query = searchInput.trim();
    setSubmittedSearch(query);
    setTripPreferences({ startDate: tripDate, travelers: travelerCount });
    setActiveFilter('All places');
    setIsSearching(true);
    if (query) {
      try {
        const results = await getDestinations(query);
        if (Array.isArray(results)) setDestinations(results);
      } catch {
        // The cards already have local data, so the search remains useful without the API.
      }
    }
    setIsSearching(false);
    document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleSaved = (id) => {
    setSavedTrips((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('trip-tastic-favourites', JSON.stringify([...next]));
      } catch {
        // Favourites still work for this visit when storage is unavailable.
      }
      return next;
    });
  };

  const today = new Date().toISOString().slice(0, 10);
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  const toggleHeroVideo = () => {
    const video = heroImageRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setIsHeroVideoPlaying(false));
    } else {
      video.pause();
    }
  };

  const updateHeroVideoProgress = (event) => {
    const video = event.currentTarget;
    if (heroVideoProgressRef.current && Number.isFinite(video.duration) && video.duration > 0) {
      heroVideoProgressRef.current.style.width = `${(video.currentTime / video.duration) * 100}%`;
    }
  };

  return (
    <>
      <div ref={scrollProgressRef} className="scroll-progress" aria-hidden="true" />
      <SiteHeader scrolled={isScrolled} />
      <main>
        <section className="hero" id="home">
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-inner page-width">
            <div className="hero-copy">
              <Reveal className="hero-copy-inner">
                <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> YOUR SOUTH INDIA TRIP COORDINATOR</p>
                <h1>Good trips.<br />Great <em>stories.</em></h1>
                <p className="hero-description">From Madurai’s first jasmine market to misty Munnar tea trails, your trip coordinator turns South India into a story that feels like yours.</p>
                <div className="hero-actions">
                  <a className="button button--lime" href="#destinations">Find your somewhere <ArrowUpRight size={17} /></a>
                  <a className="text-link" href="#our-way"><span className="play-icon"><ArrowDown size={14} /></span> Get to know us</a>
                </div>
                <div className="hero-social-proof">
                  <div className="avatar-stack" aria-hidden="true">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=90&h=90&q=80" alt="" />
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=90&h=90&q=80" alt="" />
                    <img src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=90&h=90&q=80" alt="" />
                  </div>
                  <p><strong>7 local escapes</strong><span>all across South India</span></p>
                  <span className="proof-divider" />
                  <p className="proof-small"><strong>1 : 1</strong><span>your own trip coordinator</span></p>
                </div>
              </Reveal>
            </div>
            <Reveal className="hero-visual" delay={120}>
              <div className="hero-image-frame">
                <video
                  ref={heroImageRef}
                  className="hero-image hero-video"
                  autoPlay={!prefersReducedMotion}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster="https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1260&h=750&dpr=1"
                  aria-label="A Land Rover Defender charging through muddy off-road terrain"
                  onPlay={() => setIsHeroVideoPlaying(true)}
                  onPause={() => setIsHeroVideoPlaying(false)}
                  onTimeUpdate={updateHeroVideoProgress}
                >
                  <source src="https://videos.pexels.com/video-files/30245559/12966487_1920_1080_120fps.mp4" type="video/mp4" />
                  <img src="https://images.pexels.com/videos/30245559/pexels-photo-30245559.jpeg?auto=compress&w=1260&h=750&dpr=1" alt="A Land Rover crossing a muddy off-road trail" />
                </video>
                <div className="hero-image-shade" />
                <div className="hero-dust" aria-hidden="true" />
                <div className="hero-film-tag"><span className="film-live-dot" /> OFF-ROAD MODE <i /> DEFENDER 4×4</div>
                <div className="photo-caption"><span className="caption-pin"><MapPin size={14} /></span><span><strong>Take the wild route</strong><small>South India · dust, tea stops & no rush</small></span></div>
                <div className="hero-video-controls">
                  <button type="button" onClick={toggleHeroVideo} aria-label={isHeroVideoPlaying ? 'Pause the off-road video' : 'Play the off-road video'}>
                    {isHeroVideoPlaying ? <Pause size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
                  </button>
                  <div className="video-progress-track"><span ref={heroVideoProgressRef} /></div>
                  <span>{isHeroVideoPlaying ? 'LIVE' : 'PLAY'}</span>
                </div>
                <a className="hero-video-credit" href="https://www.pexels.com/video/off-road-adventure-land-rover-in-muddy-terrain-30245559/" target="_blank" rel="noreferrer">FILM BY HARVEY TAN VILLARINO · PEXELS ↗</a>
              </div>
              <div className="hero-stamp" aria-label="Take the wild route">
                <span className="stamp-top">TAKE THE</span>
                <Globe2 size={26} strokeWidth={1.5} />
                <span className="stamp-bottom">WILD ROUTE</span>
              </div>
              <div className="hero-side-note"><span>01 / 07</span><i /> The long way is the good way</div>
              <div className="hero-scribble" aria-hidden="true">✳</div>
            </Reveal>
          </div>
          <div className="hero-bottom page-width">
            <p className="hero-bottom-note"><span>✳</span> Thoughtfully made escapes for your kind of curious.</p>
            <a className="scroll-cue" href="#about">SCROLL A LITTLE <span><ArrowDown size={14} /></span></a>
          </div>
        </section>

        <section className="search-section" id="trip-search" aria-label="Search trips">
          <form className="trip-search page-width" onSubmit={handleSearch}>
            <div className="search-heading"><span className="search-spark"><Sparkles size={17} /></span><span>Let's find your next<br /><strong>happy place.</strong></span></div>
            <label className="search-field search-location">
              <span><MapPin size={15} /> WHERE TO?</span>
              <input list="destination-options" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Anywhere you dream" aria-label="Where would you like to go?" />
              <datalist id="destination-options">{fallbackDestinations.map((trip) => <option key={trip.id} value={trip.name} />)}{regions.filter((region) => region !== 'All places').map((region) => <option key={region} value={region} />)}</datalist>
            </label>
            <label className="search-field">
              <span><CalendarDays size={15} /> WHEN?</span>
              <input type="date" min={today} value={tripDate} onChange={(event) => setTripDate(event.target.value)} aria-label="When would you like to travel?" />
            </label>
            <label className="search-field search-travellers">
              <span><UsersRound size={15} /> WHO'S COMING?</span>
              <select value={travelerCount} onChange={(event) => setTravelerCount(event.target.value)} aria-label="Number of travellers">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((number) => <option key={number} value={number}>{number} {number === 1 ? 'traveller' : 'travellers'}</option>)}
              </select>
            </label>
            <button className="search-submit" type="submit" disabled={isSearching} aria-label="Search trips">
              {isSearching ? <span className="button-loader" /> : <ArrowRight size={22} />}
            </button>
          </form>
        </section>

        <section className="intro-section page-width" id="about">
          <Reveal className="intro-kicker"><span className="kicker-line" /> THE ART OF GOING SOMEWHERE <span className="kicker-line" /></Reveal>
          <Reveal className="intro-title-wrap" delay={80}>
            <h2>Not just a trip.<br />A <em>feeling</em> you take home.</h2>
          </Reveal>
          <Reveal className="intro-aside" delay={150}>
            <span className="hand-drawn-arrow">↙</span>
            <p>For the long way round, the just-one-more-day, and the places that make you feel a little more like yourself.</p>
            <a className="underlined-link" href="#our-way">This is how we travel <ArrowUpRight size={15} /></a>
          </Reveal>
          <div className="intro-stats" aria-label="Trip Tastic by the numbers">
            <Reveal className="stat-block"><strong>32<span>+</span></strong><span>little corners of the world</span></Reveal>
            <Reveal className="stat-block" delay={100}><strong>4.9<span>/5</span></strong><span>very happy travellers</span></Reveal>
            <Reveal className="stat-block" delay={200}><strong>1<span>:</span>1</strong><span>made around you, always</span></Reveal>
          </div>
          <div className="intro-stamp" aria-hidden="true">GO<br />SLOW<br /><span>✳</span></div>
        </section>

        <section className="destination-section" id="destinations">
          <div className="page-width">
            <div className="destination-heading-row">
              <Reveal className="destination-heading-copy">
                <p className="eyebrow"><span className="eyebrow-dot" /> SOUTH INDIA, FIRST · ELSEWHERE, TOO</p>
                <h2>Somewhere<br />good is <em>calling.</em></h2>
              </Reveal>
              <Reveal className="destination-heading-aside" delay={100}>
                <span className="section-aside-mark">↗</span>
                <p>From Tamil Nadu’s hill air to Kerala’s backwaters, we’ll match the route to your kind of curious.</p>
                <span className="results-note">{filteredDestinations.length.toString().padStart(2, '0')} good places to begin</span>
              </Reveal>
            </div>

            <div className="destination-toolbar">
              <div className="filter-list" role="group" aria-label="Filter destinations by region">
                {regions.map((region) => (
                  <button key={region} className={`filter-chip ${activeFilter === region ? 'filter-chip--active' : ''}`} type="button" onClick={() => setActiveFilter(region)} aria-pressed={activeFilter === region}>{region}</button>
                ))}
              </div>
              {submittedSearch && <button className="clear-search" type="button" onClick={() => {
                setSubmittedSearch('');
                setSearchInput('');
                getDestinations().then((data) => {
                  if (Array.isArray(data) && data.length) setDestinations(data);
                }).catch(() => setDestinations(fallbackDestinations));
              }}>Clear “{submittedSearch}” <X size={13} /></button>}
            </div>

            {filteredDestinations.length ? (
              <div className="destination-grid">
                {filteredDestinations.map((trip, index) => (
                  <DestinationCard key={trip.id} trip={trip} index={index} onExplore={setSelectedTrip} isSaved={savedTrips.has(trip.id)} onSave={toggleSaved} />
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <span><Compass size={25} /></span>
                <h3>That somewhere's still a secret.</h3>
                <p>Try another place, or clear your search to see all of our favourites.</p>
                <button className="button button--dark" type="button" onClick={() => {
                  setSubmittedSearch('');
                  setSearchInput('');
                  setActiveFilter('All places');
                  getDestinations().then((data) => {
                    if (Array.isArray(data) && data.length) setDestinations(data);
                  }).catch(() => setDestinations(fallbackDestinations));
                }}>Show me everywhere <ArrowRight size={16} /></button>
              </div>
            )}

            <div className="destination-footer-note"><span className="tiny-sun">✳</span><span>Small groups. Local eyes. A lot of heart.</span><a href="#our-way">A bit more about our way <ArrowUpRight size={14} /></a></div>
          </div>
        </section>

        <section className="manifesto-section" id="our-way" ref={journeyRef}>
          <div className="manifesto-orbit manifesto-orbit--one" aria-hidden="true" />
          <div className="manifesto-orbit manifesto-orbit--two" aria-hidden="true" />
          <div className="page-width manifesto-layout">
            <div className="manifesto-copy">
              <Reveal>
                <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> OUR KIND OF TRAVEL</p>
                <h2>Leave room<br />for the <em>unexpected.</em></h2>
                <p className="manifesto-intro">A good itinerary gets you there. A great one leaves a little space for the moments you couldn't plan if you tried.</p>
                <a className="manifesto-link" href="#trip-search">Let's make a little room <ArrowUpRight size={16} /></a>
              </Reveal>
              <span className="manifesto-coordinate">44° 29′ N<br />11° 20′ E</span>
            </div>
            <div className="journey-column">
              <div className="journey-route" aria-hidden="true"><span ref={journeyFillRef} /><i className="route-dot route-dot--one" /><i className="route-dot route-dot--two" /><i className="route-dot route-dot--three" /></div>
              <Reveal as="article" className="journey-step">
                <span className="step-number">01</span><div><span className="step-kicker">FIRST, WE LISTEN</span><h3>It starts with <em>you.</em></h3><p>Slow down over a cup of something. Tell us what makes you feel alive, and we’ll take it from there.</p></div><span className="step-doodle">↗</span>
              </Reveal>
              <Reveal as="article" className="journey-step" delay={120}>
                <span className="step-number">02</span><div><span className="step-kicker">THEN, WE GET CURIOUS</span><h3>Off the usual <em>map.</em></h3><p>Local hosts, little-known stays, and the kind of places you only find when someone lets you in.</p></div><span className="step-doodle">✳</span>
              </Reveal>
              <Reveal as="article" className="journey-step" delay={240}>
                <span className="step-number">03</span><div><span className="step-kicker">FINALLY, YOU GO</span><h3>Make it a <em>story.</em></h3><p>We take care of the details. You get to be there for the whole, lovely, unhurried thing.</p></div><span className="step-doodle">♡</span>
              </Reveal>
            </div>
          </div>
          <div className="manifesto-bottom-line"><span>LESS CHECKING BOXES</span><i /><span>MORE FEELING THE PLACE</span><i /><span>ALWAYS A LITTLE TASTIC</span></div>
        </section>

        <section className="quote-section page-width">
          <Reveal className="quote-decoration" aria-hidden="true">“</Reveal>
          <Reveal className="quote-content" delay={100}>
            <p className="eyebrow"><span className="eyebrow-dot" /> NOTES FROM THE ROAD</p>
            <blockquote>“I came home with sand in every bag and a whole new idea of what a holiday could feel like.”</blockquote>
            <div className="quote-attribution"><span className="quote-avatar">M</span><span><strong>Maya R.</strong><small>Bali, with Trip Tastic · May '25</small></span><span className="quote-stars">★★★★★</span></div>
          </Reveal>
          <div className="quote-side-note">A GOOD TRIP<br />STAYS WITH YOU <span>↙</span></div>
        </section>

        <section className="closing-section">
          <div className="closing-photo" aria-hidden="true" />
          <div className="closing-overlay" />
          <Reveal className="closing-content page-width">
            <p className="eyebrow eyebrow--light"><span className="eyebrow-dot" /> THE WORLD'S STILL OUT THERE</p>
            <h2>Ready when<br />you <em>are.</em></h2>
            <p>Tell us what you’re dreaming of. We’ll meet you somewhere lovely.</p>
            <a className="button button--lime" href="#trip-search">Start dreaming <ArrowUpRight size={17} /></a>
            <span className="closing-scribble" aria-hidden="true">✳</span>
          </Reveal>
          <span className="closing-image-credit">A little somewhere in Portugal · 38° 42′ N</span>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-top">
          <div className="footer-brand-column"><Brand light /><p>Small trips. Big feelings.<br />That's the whole idea.</p></div>
          <div className="footer-links"><span>GO ON, HAVE A LOOK</span><a href="#destinations">Find your somewhere</a><a href="#our-way">Our kind of travel</a><a href="#about">The good stuff</a></div>
          <div className="footer-note"><span>A LITTLE NOTE FROM US</span><p>Made for people who'd rather remember how a place felt than how many things they saw.</p><a href="mailto:hello@triptastic.example">Say hello <ArrowUpRight size={14} /></a></div>
          <a className="back-to-top" href="#home" aria-label="Back to top"><ArrowUpRight size={19} /></a>
        </div>
        <div className="page-width footer-bottom"><span>© {new Date().getFullYear()} TRIP TASTIC. MADE WITH A LITTLE WANDERLUST.</span><span>GO WELL. COME BACK DIFFERENT.</span></div>
      </footer>

      {selectedTrip && <TripModal trip={selectedTrip} preferences={tripPreferences} onClose={() => setSelectedTrip(null)} />}
    </>
  );
}
