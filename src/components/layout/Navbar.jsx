import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiMenuAlt3, HiX } from 'react-icons/hi'
import { FaArrowRight, FaChevronDown } from 'react-icons/fa'
import { useSite } from '../../contexts/SiteContext'

const SPORTS_NAV = [
  { to: '/sports/football-futsal', emoji: '⚽', label: 'Football / Futsal',  desc: 'Academy programs for ages 4–18' },
  { to: '/sports/basketball',      emoji: '🏀', label: 'Basketball',          desc: 'Courts & professional coaching' },
  { to: '/sports/pickleball',      emoji: '🎾', label: 'Pickleball',          desc: "Nepal's premier pickleball courts" },
  { to: '/sports/snooker',         emoji: '🎱', label: 'Snooker',             desc: 'Premium club & professional tables' },
  { to: '/sports/sports-bar',      emoji: '🍹', label: 'Sports Bar',          desc: 'Live sports, drinks & great vibes' },
]

const LINKS = [
  { to: '/about',    label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/gallery',  label: 'Gallery' },
  { to: '/blog',     label: 'Blog' },
  { to: '/contact',  label: 'Contact' },
]

export default function Navbar() {
  const { logoURL, academyName } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileDropOpen, setMobileDropOpen] = useState(false)
  const dropdownRef = useRef(null)
  const closeTimer = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false)
    setDropdownOpen(false)
    setMobileDropOpen(false)
  }, [location.pathname])

  const openDropdown = () => {
    clearTimeout(closeTimer.current)
    setDropdownOpen(true)
  }
  const closeDropdown = () => {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 120)
  }

  const isSportsActive = location.pathname.startsWith('/sports')

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

            {/* Sports & Facilities Dropdown */}
            <div className="relative" ref={dropdownRef} onMouseEnter={openDropdown} onMouseLeave={closeDropdown}>
              <button
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md text-[13px] font-heading font-medium transition-all duration-200 ${isSportsActive ? 'text-gold bg-white/10' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
                onClick={() => setDropdownOpen(v => !v)}
              >
                Sports &amp; Facilities
                <motion.span animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <FaChevronDown size={10} />
                </motion.span>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    onMouseEnter={openDropdown}
                    onMouseLeave={closeDropdown}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] bg-[#0A1A6A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                  >
                    {/* Dropdown header */}
                    <div className="px-4 pt-4 pb-2 border-b border-white/8">
                      <p className="text-gold text-[10px] font-heading font-semibold uppercase tracking-widest">Sports &amp; Facilities</p>
                      <p className="text-white/40 text-xs mt-0.5">One Hub. Many Experiences.</p>
                    </div>

                    <div className="p-2">
                      {SPORTS_NAV.map(({ to, emoji, label, desc }) => (
                        <Link
                          key={to}
                          to={to}
                          className="flex items-center gap-3.5 px-3 py-3 rounded-xl hover:bg-white/8 transition-all duration-150 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-white/8 group-hover:bg-gold/15 flex items-center justify-center text-xl shrink-0 transition-colors duration-150">
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

                    <div className="px-4 pb-4 pt-1 border-t border-white/8">
                      <Link to="/enroll"
                        className="flex items-center justify-center gap-2 w-full bg-gold text-navy font-heading font-bold text-xs py-2.5 rounded-xl hover:bg-yellow-400 transition-colors">
                        Enroll in Any Sport <FaArrowRight size={10} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {LINKS.filter(l => l.to !== '/about').map(({ to, label }) => (
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

                {/* Sports & Facilities expandable */}
                <div>
                  <button
                    onClick={() => setMobileDropOpen(v => !v)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-heading font-medium transition-all ${isSportsActive ? 'bg-gold/15 text-gold' : 'text-white/70 hover:text-white hover:bg-white/8'}`}
                  >
                    <span>Sports &amp; Facilities</span>
                    <motion.span animate={{ rotate: mobileDropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <FaChevronDown size={12} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {mobileDropOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                          {SPORTS_NAV.map(({ to, emoji, label }) => (
                            <Link key={to} to={to}
                              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-heading font-medium text-white/60 hover:text-gold hover:bg-white/5 transition-all">
                              <span>{emoji}</span> {label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <MobileNavLink to="/programs" label="Programs" />
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
