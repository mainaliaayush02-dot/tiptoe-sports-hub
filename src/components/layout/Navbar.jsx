import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { FaArrowRight, FaChevronDown } from 'react-icons/fa'
import { useSite } from '../../contexts/SiteContext'

const ACADEMY_NAV = [
  { to: '/sports/football-futsal', emoji: '⚽', label: 'Football & Futsal Academy', desc: 'Programs for ages 4–18 · Thailand exposure' },
  { to: '/coaches',                emoji: '🧑‍🏫', label: 'Our Coaches',              desc: 'National-level coaching staff' },
  { to: '/programs',               emoji: '📋', label: 'Training Programs',         desc: 'All programs & enrollment info' },
]

const HUB_NAV = [
  { to: '/sports/football-futsal', emoji: '⚽', label: 'Football & Futsal', desc: 'Facilities & open play' },
  { to: '/sports/cricket',         emoji: '🏏', label: 'Cricket',           desc: 'Cricket ground & facilities' },
  { to: '/sports/basketball',      emoji: '🏀', label: 'Basketball',        desc: 'Courts & professional coaching' },
  { to: '/sports/pickleball',      emoji: '🎾', label: 'Pickleball',        desc: "Nepal's premier pickleball courts" },
  { to: '/sports/snooker',         emoji: '🎱', label: 'Snooker',           desc: 'Premium club & professional tables' },
  { to: '/sports/sports-bar',      emoji: '🍹', label: 'Sports Bar',        desc: 'Live sports, drinks & great vibes' },
]

function DropdownMenu({ items, header, subheader, ctaLabel, ctaTo, onMouseEnter, onMouseLeave, wide }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${wide ? 'w-[360px]' : 'w-[320px]'} bg-[#0A1A6A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50`}
    >
      <div className="px-4 pt-4 pb-2 border-b border-white/8">
        <p className="text-gold text-[10px] font-heading font-semibold uppercase tracking-widest">{header}</p>
        <p className="text-white/40 text-xs mt-0.5">{subheader}</p>
      </div>
      <div className="p-2">
        {items.map(({ to, emoji, label, desc }) => (
          <Link key={`${to}-${label}`} to={to}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-all duration-150 group">
            <div className="w-9 h-9 rounded-xl bg-white/8 group-hover:bg-gold/15 flex items-center justify-center text-lg shrink-0 transition-colors duration-150">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-heading font-semibold text-[13px] leading-none mb-0.5 group-hover:text-gold transition-colors">{label}</div>
              <div className="text-white/40 text-[11px] leading-snug truncate">{desc}</div>
            </div>
            <FaArrowRight size={9} className="text-white/20 group-hover:text-gold transition-colors shrink-0" />
          </Link>
        ))}
      </div>
      {ctaLabel && (
        <div className="px-4 pb-4 pt-1 border-t border-white/8">
          <Link to={ctaTo}
            className="flex items-center justify-center gap-2 w-full bg-gold text-navy font-heading font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-400 transition-colors">
            {ctaLabel} <FaArrowRight size={10} />
          </Link>
        </div>
      )}
    </motion.div>
  )
}

export default function Navbar() {
  const { logoURL, academyName } = useSite()
  const [scrolled, setScrolled]           = useState(false)
  const [open, setOpen]                   = useState(false)
  const [academyOpen, setAcademyOpen]     = useState(false)
  const [hubOpen, setHubOpen]             = useState(false)
  const [mobileAcadOpen, setMobileAcadOpen] = useState(false)
  const [mobileHubOpen, setMobileHubOpen]   = useState(false)
  const academyRef  = useRef(null)
  const hubRef      = useRef(null)
  const acadTimer   = useRef(null)
  const hubTimer    = useRef(null)
  const location    = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    setOpen(false); setAcademyOpen(false); setHubOpen(false)
    setMobileAcadOpen(false); setMobileHubOpen(false)
  }, [location.pathname])

  const openAcad  = () => { clearTimeout(acadTimer.current); setAcademyOpen(true) }
  const closeAcad = () => { acadTimer.current = setTimeout(() => setAcademyOpen(false), 120) }
  const openHub   = () => { clearTimeout(hubTimer.current); setHubOpen(true) }
  const closeHub  = () => { hubTimer.current = setTimeout(() => setHubOpen(false), 120) }

  const isAcademyActive = ['/coaches', '/programs', '/sports/football-futsal'].includes(location.pathname)
  const isHubActive     = location.pathname.startsWith('/sports')

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-navy shadow-nav' : 'bg-navy/98 backdrop-blur-md'}`}>
        <div className="h-[3px] bg-gradient-to-r from-gold via-yellow-300 to-gold" />
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 bg-white rounded-lg overflow-hidden flex items-center justify-center shadow-sm">
              <img src={logoURL} alt={academyName} className="w-full h-full object-contain"
                onError={e => { e.target.style.display = 'none' }} />
            </div>
            <div className="leading-tight">
              <div className="text-white font-heading font-extrabold text-[15px] tracking-tight leading-none">TIPTOE</div>
              <div className="text-gold font-heading font-semibold text-[9px] tracking-[0.2em] uppercase mt-0.5">Sports Hub</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            <NavLink to="/about"
              className={({ isActive }) => `px-3.5 py-2 rounded-md text-[13px] font-heading font-medium transition-all duration-200 ${isActive ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
              About
            </NavLink>

            {/* Academy Dropdown */}
            <div className="relative" ref={academyRef} onMouseEnter={openAcad} onMouseLeave={closeAcad}>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-heading font-medium transition-all duration-200 ${isAcademyActive ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
                onClick={() => setAcademyOpen(v => !v)}
              >
                Academy
                <motion.span animate={{ rotate: academyOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown size={10} />
                </motion.span>
              </button>
              <AnimatePresence>
                {academyOpen && (
                  <DropdownMenu
                    items={ACADEMY_NAV}
                    header="Tiptoe Sports Academy"
                    subheader="Football & Futsal development programs"
                    ctaLabel="Enroll in Academy"
                    ctaTo="/enroll"
                    onMouseEnter={openAcad}
                    onMouseLeave={closeAcad}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Sports Hub Dropdown */}
            <div className="relative" ref={hubRef} onMouseEnter={openHub} onMouseLeave={closeHub}>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-heading font-medium transition-all duration-200 ${isHubActive && !isAcademyActive ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
                onClick={() => setHubOpen(v => !v)}
              >
                Sports Hub &amp; Facilities
                <motion.span animate={{ rotate: hubOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown size={10} />
                </motion.span>
              </button>
              <AnimatePresence>
                {hubOpen && (
                  <DropdownMenu
                    items={HUB_NAV}
                    header="Tiptoe Sports Hub"
                    subheader="Multi-sport destination · All facilities"
                    ctaLabel="Explore All Sports"
                    ctaTo="/sports/football-futsal"
                    onMouseEnter={openHub}
                    onMouseLeave={closeHub}
                    wide
                  />
                )}
              </AnimatePresence>
            </div>

            {[
              { to: '/gallery', label: 'Gallery' },
              { to: '/blog',    label: 'Blog' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `px-3.5 py-2 rounded-md text-[13px] font-heading font-medium transition-all duration-200 ${isActive ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/enroll"
              className="hidden sm:inline-flex items-center gap-2 bg-gold text-navy font-heading font-semibold text-[13px] px-5 py-2.5 rounded-lg hover:bg-yellow-400 active:scale-[0.98] transition-all">
              Enroll Now <FaArrowRight size={11} />
            </Link>
            <button onClick={() => setOpen(v => !v)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              aria-label="Toggle menu">
              {open ? <HiX size={22} /> : <HiMenuAlt3 size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-dark/75 z-40 lg:hidden"
              onClick={() => setOpen(false)} />

            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.26 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-navy z-50 lg:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              <div className="h-[3px] bg-gradient-to-r from-gold via-yellow-300 to-gold" />
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white rounded-lg overflow-hidden">
                    <img src={logoURL} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display = 'none'} />
                  </div>
                  <span className="text-white font-heading font-extrabold text-sm">TIPTOE <span className="text-gold">SPORTS HUB</span></span>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white p-1"><HiX size={20} /></button>
              </div>

              <nav className="flex-1 px-3 py-4 space-y-0.5">
                <MobileNavLink to="/about" label="About" />

                {/* Academy expandable */}
                <MobileDropSection
                  label="Academy"
                  badge="Football & Futsal"
                  isOpen={mobileAcadOpen}
                  onToggle={() => setMobileAcadOpen(v => !v)}
                  isActive={isAcademyActive}
                  items={ACADEMY_NAV}
                />

                {/* Sports Hub expandable */}
                <MobileDropSection
                  label="Sports Hub & Facilities"
                  badge="All Sports & Venues"
                  isOpen={mobileHubOpen}
                  onToggle={() => setMobileHubOpen(v => !v)}
                  isActive={isHubActive && !isAcademyActive}
                  items={HUB_NAV}
                />

                <MobileNavLink to="/gallery"  label="Gallery" />
                <MobileNavLink to="/blog"     label="Blog" />
                <MobileNavLink to="/contact"  label="Contact" />
              </nav>

              <div className="px-5 py-5 border-t border-white/10 shrink-0">
                <Link to="/enroll"
                  className="w-full flex items-center justify-center gap-2 bg-gold text-navy font-heading font-semibold text-sm py-3.5 rounded-lg hover:bg-yellow-400 transition-all">
                  Enroll Now <FaArrowRight size={12} />
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileNavLink({ to, label }) {
  return (
    <NavLink to={to}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-3 rounded-lg text-sm font-heading font-medium transition-all ${isActive ? 'bg-gold/15 text-gold' : 'text-white/70 hover:text-white hover:bg-white/8'}`
      }>
      {label}
      <FaArrowRight size={10} className="opacity-40" />
    </NavLink>
  )
}

function MobileDropSection({ label, badge, isOpen, onToggle, isActive, items }) {
  return (
    <div>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-heading font-medium transition-all ${isActive ? 'bg-gold/15 text-gold' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
      >
        <div className="flex flex-col items-start">
          <span>{label}</span>
          <span className="text-[10px] text-white/30 font-normal mt-0.5">{badge}</span>
        </div>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FaChevronDown size={12} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
              {items.map(({ to, emoji, label: itemLabel }) => (
                <Link key={`${to}-${itemLabel}`} to={to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-heading font-medium text-white/60 hover:text-gold hover:bg-white/5 transition-all">
                  <span>{emoji}</span> {itemLabel}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
