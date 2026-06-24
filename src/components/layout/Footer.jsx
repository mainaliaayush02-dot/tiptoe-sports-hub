import { Link } from 'react-router-dom'
import {
  FaInstagram, FaFacebook, FaTiktok,
  FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
  FaArrowRight, FaExternalLinkAlt,
} from 'react-icons/fa'
import { useSite } from '../../contexts/SiteContext'

const SPORTS_LINKS = [
  { to: '/sports/football-futsal', emoji: '⚽', label: 'Football & Futsal' },
  { to: '/sports/cricket',         emoji: '🏏', label: 'Cricket' },
  { to: '/sports/basketball',      emoji: '🏀', label: 'Basketball' },
  { to: '/sports/pickleball',      emoji: '🎾', label: 'Pickleball' },
  { to: '/sports/snooker',         emoji: '🎱', label: 'Snooker' },
  { to: '/sports/sports-lounge',   emoji: '📺', label: 'Sports Lounge' },
]

const QUICK_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About Us' },
  { to: '/academy',   label: 'Academy' },
  { to: '/programs',  label: 'Programs' },
  { to: '/schedule',  label: 'Schedule' },
  { to: '/coaches',   label: 'Coaches' },
  { to: '/pricing',   label: 'Pricing' },
  { to: '/faq',       label: 'FAQ' },
  { to: '/contact',   label: 'Contact' },
]

export default function Footer() {
  const { academyName, phone, email, address, mapsLink, logoURL, academyLogoURL, socialLinks, hoursWeekdays, hoursSaturday, hoursSunday } = useSite()

  return (
    <footer className="bg-dark text-white">

      {/* CTA Strip */}
      <div className="bg-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="section-label-gold mb-1">Join Us Today</p>
            <h3 className="text-white font-heading font-bold text-2xl md:text-3xl">
              Ready to Start Your Journey?
            </h3>
          </div>
          <Link to="/enroll" className="btn-primary shrink-0">
            Enroll Now <FaArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-4 mb-5">
              {/* Hub logo — clicks to Home */}
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden p-1 shrink-0 ring-1 ring-white/15 group-hover:ring-2 group-hover:ring-gold/50 transition-all">
                  <img src={logoURL} alt="Tiptoe Sports Hub"
                    className="w-full h-full object-contain"
                    onError={e => e.target.style.display = 'none'} />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-white text-[14px] tracking-tight leading-none group-hover:text-gold transition-colors">TIPTOE</div>
                  <div className="text-gold font-heading font-semibold text-[8px] tracking-[0.2em] uppercase mt-0.5">Sports Hub</div>
                </div>
              </Link>
              {/* Divider */}
              <div className="w-px h-8 bg-white/15 shrink-0" />
              {/* Academy logo — clicks to Academy page */}
              <Link to="/academy" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-white rounded-lg overflow-hidden p-1 shrink-0 ring-1 ring-white/15 group-hover:ring-2 group-hover:ring-gold/50 transition-all">
                  <img src={academyLogoURL} alt="Tiptoe Sports Academy"
                    className="w-full h-full object-contain"
                    onError={e => e.target.style.display = 'none'} />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-white text-[14px] tracking-tight leading-none group-hover:text-gold transition-colors">TIPTOE</div>
                  <div className="text-gold font-heading font-semibold text-[8px] tracking-[0.2em] uppercase mt-0.5">Academy</div>
                </div>
              </Link>
            </div>

            <p className="text-white/45 text-sm leading-relaxed mb-5">
              Nepal's premier multi-sport hub in Tarkeshwar, Kathmandu. Football, Basketball, Pickleball, Snooker and Sports Lounge, all under one roof since 2021.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {[
                { href: socialLinks?.instagram, Icon: FaInstagram, label: 'Instagram' },
                { href: socialLinks?.facebook,  Icon: FaFacebook,  label: 'Facebook'  },
                { href: socialLinks?.tiktok,    Icon: FaTiktok,    label: 'TikTok'    },
              ].filter(s => s.href).map(({ href, Icon, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                  className="w-9 h-9 bg-white/8 hover:bg-gold hover:text-navy rounded-lg flex items-center justify-center text-white/60 transition-all duration-200">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-widest mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-white/45 hover:text-gold text-sm transition-colors duration-200 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports & Facilities */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-widest mb-5">
              Sports &amp; Facilities
            </h4>
            <ul className="space-y-2.5">
              {SPORTS_LINKS.map(({ to, emoji, label }) => (
                <li key={to}>
                  <Link to={to}
                    className="text-white/45 hover:text-gold text-sm transition-colors duration-200 flex items-center gap-2.5 group">
                    <span className="text-base leading-none">{emoji}</span>
                    <span className="group-hover:text-gold transition-colors">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-white/8">
              <Link to="/academy"
                className="flex items-center gap-2 text-white/45 hover:text-gold text-sm font-semibold transition-colors duration-200 group">
                <span className="w-1.5 h-1.5 bg-gold rounded-full opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                About the Academy
              </Link>
              <Link to="/programs"
                className="flex items-center gap-2 text-white/45 hover:text-gold text-sm font-semibold mt-2.5 transition-colors duration-200 group">
                <span className="w-1.5 h-1.5 bg-gold rounded-full opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                Training Programs
              </Link>
              <Link to="/enroll"
                className="inline-flex items-center gap-2 mt-4 bg-gold text-navy text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-yellow-400 transition-colors">
                Enroll Now <FaArrowRight size={10} />
              </Link>
            </div>
          </div>

          {/* Contact / Find Us */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-widest mb-5">
              Find Us
            </h4>
            <ul className="space-y-4">
              {/* Address with postal code */}
              <li className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-gold mt-0.5 shrink-0" size={13} />
                <a href="https://maps.app.goo.gl/GXdjUV3qQX4Rm61o7" target="_blank" rel="noopener noreferrer"
                  className="text-white/45 hover:text-gold text-sm leading-relaxed transition-colors flex items-start gap-1.5 group">
                  <span>Tarakeshwar, Kathmandu 44600, Nepal</span>
                  <FaExternalLinkAlt size={9} className="mt-1 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                </a>
              </li>

              {/* Primary phone */}
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-gold shrink-0" size={12} />
                <div className="space-y-0.5">
                  <a href="tel:+977-984-1416893" className="text-white/45 hover:text-gold text-sm transition-colors block">
                    +977-984-1416893
                  </a>
                  <a href="tel:+977-970-7079773" className="text-white/45 hover:text-gold text-sm transition-colors block">
                    +977-970-7079773
                  </a>
                </div>
              </li>

              {/* Email */}
              {email && (
                <li className="flex items-center gap-3">
                  <FaEnvelope className="text-gold shrink-0" size={13} />
                  <a href={`mailto:${email}`}
                    className="text-white/45 hover:text-gold text-sm transition-colors break-all">
                    {email}
                  </a>
                </li>
              )}
            </ul>

            {/* Opening hours */}
            <div className="mt-5 pt-5 border-t border-white/8">
              <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-widest mb-3">
                Opening Hours
              </h4>
              <div className="space-y-1.5 text-xs text-white/40">
                <div className="flex justify-between gap-4">
                  <span>Mon – Fri</span>
                  <span className="text-white/60">{hoursWeekdays}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span className="text-white/60">{hoursSaturday}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Sunday</span>
                  <span className="text-white/60">{hoursSunday}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/25 text-xs">
            &copy; {new Date().getFullYear()} {academyName}. All rights reserved.
          </p>
          <div className="flex gap-5">
            <Link to="/enroll"  className="text-white/25 hover:text-gold text-xs transition-colors">Enroll</Link>
            <Link to="/contact" className="text-white/25 hover:text-gold text-xs transition-colors">Contact</Link>
            <Link to="/about"   className="text-white/25 hover:text-gold text-xs transition-colors">About</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-5 md:px-8 pb-5 text-center">
          <p className="text-white/20 text-xs">
            Designed &amp; crafted by{' '}
            <a
              href="https://aayushmainali.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/35 hover:text-gold transition-colors duration-200"
            >
              Aayush Mainali
            </a>
          </p>
        </div>
      </div>

    </footer>
  )
}
