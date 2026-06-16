import { useState, useEffect } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { query, where, limit, onSnapshot } from 'firebase/firestore'
import { FaArrowRight, FaCheckCircle, FaCalendarAlt, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa'
import { sportsCol } from '../../firebase/collections'
import { useSite } from '../../contexts/SiteContext'
import SEOHead from '../../components/SEOHead'

const DEFAULT_SPORTS = {
  'football-futsal': {
    name: 'Football & Futsal',
    emoji: '⚽',
    tagline: "Nepal's Premier Football & Futsal Academy",
    description: "Tiptoe Sports Hub is Nepal's #1 private football and futsal academy, delivering world-class coaching to 370+ students daily in Tarkeshwar, Kathmandu. Our structured programs run from ages 4 to 18, combining technical skill development, tactical training, and international exposure through Thailand training camps and cross-border tournaments.",
    features: ['Professional national-level coaching staff', 'Age-structured programs (4–18)', 'Annual Thailand training camps', 'International tournament exposure', 'Girls-dedicated football program', 'Indoor futsal & outdoor football'],
    facilities: ['Full-size outdoor football field', 'Indoor futsal court', 'Changing rooms & showers', 'Equipment room & kit storage', 'Coaching video analysis setup'],
    pricing: [
      { plan: 'Football Foundation', age: 'Age 4–10',  price: 'NPR 2,500/month', desc: 'Fundamentals & fun-first development' },
      { plan: 'Youth Development',   age: 'Age 11–15', price: 'NPR 3,000/month', desc: 'Tactical & competitive preparation' },
      { plan: 'Elite Performance',   age: 'Age 16–18', price: 'NPR 3,500/month', desc: 'High-intensity professional track' },
      { plan: 'Futsal Academy',      age: 'All Ages',  price: 'NPR 2,800/month', desc: 'Dedicated indoor futsal program' },
      { plan: 'Girls Football',      age: 'Age 8–18',  price: 'NPR 2,500/month', desc: 'Safe, empowering development environment' },
    ],
    schedule: 'Mon–Fri: 6AM–8AM & 3PM–7PM | Sat–Sun: 7AM–12PM',
    seoTitle: 'Football & Futsal Academy in Kathmandu | Tiptoe Sports Hub',
    seoDescription: "Nepal's #1 football and futsal academy in Tarkeshwar, Kathmandu. Programs for ages 4–18, professional coaches, and international exposure to Thailand.",
    color: '#06145F',
    badge: 'Primary Sport',
  },
  'basketball': {
    name: 'Basketball',
    emoji: '🏀',
    tagline: 'Premium Courts & Professional Coaching',
    description: "Experience premium basketball training and open play at Tiptoe Sports Hub. Our professional-grade courts and coaching staff provide the perfect environment for players of all skill levels — from beginners picking up a ball for the first time to competitive athletes sharpening their game.",
    features: ['Professional full-size courts', 'Skill development coaching sessions', 'Open play & recreational hours', 'Youth & adult training groups', 'Team booking available', 'Competitive league registration support'],
    facilities: ['Full-size basketball court', 'Scoreboard & timing system', 'Comfortable spectator seating', 'Locker rooms with showers', 'Ball & equipment rental'],
    pricing: [
      { plan: 'Court Hire',       age: 'Per hour',   price: 'NPR 1,500/hr',     desc: 'Casual open play, walk-ins welcome' },
      { plan: 'Monthly Membership', age: 'All Ages', price: 'NPR 4,000/month',  desc: 'Unlimited court access' },
      { plan: 'Coaching Program', age: 'All Ages',   price: 'NPR 3,500/month',  desc: 'Coached sessions, skill tracking' },
      { plan: 'Team Package',     age: '5+ players', price: 'NPR 6,000/month',  desc: 'Team court time + coach feedback' },
    ],
    schedule: 'Daily: 6AM–10PM | Coached sessions: Tue, Thu, Sat 5PM–7PM',
    seoTitle: 'Basketball Courts & Training in Kathmandu | Tiptoe Sports Hub',
    seoDescription: 'Premium basketball courts and professional training in Tarkeshwar, Kathmandu. Open play, monthly memberships, and coached sessions for all ages.',
    color: '#B85A00',
    badge: 'Popular',
  },
  'pickleball': {
    name: 'Pickleball',
    emoji: '🎾',
    tagline: "Nepal's Premier Pickleball Facility",
    description: "Discover the fastest-growing racket sport at Tiptoe Sports Hub. Pickleball combines elements of tennis, badminton, and ping-pong into an exciting, fast-paced game that's easy to learn and incredibly fun. We offer dedicated courts, professional equipment, coaching for beginners, and regular tournaments for competitive players.",
    features: ["Nepal's first dedicated pickleball courts", 'Beginner-friendly with easy learning curve', 'Professional paddle & ball rental', 'Beginner group coaching sessions', 'Monthly tournaments & competitions', 'Family-friendly, all ages welcome'],
    facilities: ['Dedicated pickleball courts', 'Professional court lighting', 'Equipment rental & retail', 'Refreshments corner', 'Spectator seating'],
    pricing: [
      { plan: 'Court Hire',       age: 'Per hour',  price: 'NPR 1,200/hr',     desc: 'Includes paddles & balls' },
      { plan: 'Monthly Access',   age: 'All Ages',  price: 'NPR 3,500/month',  desc: 'Unlimited court access' },
      { plan: 'Coaching Package', age: 'Beginners', price: 'NPR 4,000/month',  desc: '8 coached sessions/month' },
      { plan: 'Tournament Entry', age: 'Members',   price: 'NPR 500/event',    desc: 'Monthly competitive events' },
    ],
    schedule: 'Daily: 6AM–10PM | Beginner sessions: Mon, Wed 6PM–8PM',
    seoTitle: 'Pickleball Courts in Kathmandu | Tiptoe Sports Hub',
    seoDescription: "Nepal's premier pickleball facility in Tarkeshwar, Kathmandu. Beginner-friendly courts, equipment included, coaching and monthly tournaments.",
    color: '#1B7F5E',
    badge: 'Trending',
  },
  'snooker': {
    name: 'Snooker',
    emoji: '🎱',
    tagline: 'Premium Snooker Club & Professional Tables',
    description: "Tiptoe Sports Hub's snooker club offers the finest billiards experience in Kathmandu. With professional-grade tables, optimal lighting, and a relaxed premium atmosphere, it's the perfect venue for casual play, practice sessions, or competitive matches. Memberships available with exclusive perks.",
    features: ['Professional full-size snooker tables', 'Premium tournament-grade lighting', 'Cues & chalk provided', 'Lounge seating & relaxed atmosphere', 'Membership priority booking', 'Competitions & league play'],
    facilities: ['Multiple professional snooker tables', 'Dedicated table lighting rigs', 'Comfortable lounge area', 'Cue & equipment rack', 'Refreshment service'],
    pricing: [
      { plan: 'Table Hire',       age: 'Per hour', price: 'NPR 800/hr',        desc: 'Per table, equipment included' },
      { plan: 'Monthly Member',   age: 'All Ages', price: 'NPR 3,000/month',   desc: 'Unlimited play + priority booking' },
      { plan: 'VIP Membership',   age: 'Adults',   price: 'NPR 5,000/month',   desc: 'Priority booking, lounge access, events' },
      { plan: 'Day Pass',         age: 'All Ages', price: 'NPR 400/day',       desc: 'Full day table access' },
    ],
    schedule: 'Daily: 10AM–11PM | Open 7 days a week',
    seoTitle: 'Snooker Club in Kathmandu | Tiptoe Sports Hub',
    seoDescription: 'Premium snooker club with professional tables in Tarkeshwar, Kathmandu. Table hire, memberships, VIP packages and a relaxed club atmosphere.',
    color: '#2D7D46',
    badge: 'Members Club',
  },
  'sports-bar': {
    name: 'Sports Bar',
    emoji: '🍹',
    tagline: 'Live Sports, Premium Drinks & Great Vibes',
    description: "The ultimate sports viewing and social experience at Tiptoe Sports Hub. Our Sports Bar features multiple large HD screens broadcasting live international and local sports events, a premium drinks menu, great food, and a vibrant atmosphere that brings the community together. Whether you're watching the Champions League, the World Cup, or the Nepal Super League, there's no better place to be.",
    features: ['Multiple large HD projection screens', 'Live broadcasting of major sports events', 'Full premium drinks & cocktail menu', 'Food & snacks menu available', 'Private event & match-day bookings', 'Open during all major sports seasons'],
    facilities: ['Large HD projection screens', 'Full bar service', 'Indoor lounge seating', 'Outdoor terrace area', 'Private event space (up to 50 guests)', 'Live sports satellite subscription'],
    pricing: [
      { plan: 'Walk-In',          age: 'All guests', price: 'Free entry',          desc: 'With minimum drink purchase' },
      { plan: 'VIP Table (4 pax)', age: 'Groups',    price: 'NPR 2,000 min spend', desc: 'Reserved seating, priority service' },
      { plan: 'Private Event',    age: 'Groups',     price: 'Contact for quote',   desc: 'Exclusive venue hire with catering' },
      { plan: 'Match Day Package', age: 'Groups',    price: 'NPR 5,000 / 10 pax', price2: 'Food + drinks + reserved seating' },
    ],
    schedule: 'Mon–Thu: 4PM–11PM | Fri–Sun: 12PM–12AM | Special event hours vary',
    seoTitle: 'Sports Bar in Kathmandu | Tiptoe Sports Hub',
    seoDescription: "Kathmandu's premier sports bar in Tarkeshwar. Live sports on big screens, premium drinks, great food and unforgettable match-day atmospheres.",
    color: '#8B4A00',
    badge: 'Social Hub',
  },
}

const VALID_SLUGS = Object.keys(DEFAULT_SPORTS)

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }
const stagger = { show: { transition: { staggerChildren: 0.09 } } }

export default function SportPage() {
  const { slug } = useParams()
  const { phone, address, mapsLink } = useSite()
  const [firestoreData, setFirestoreData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    const q = query(sportsCol, where('slug', '==', slug), limit(1))
    const unsub = onSnapshot(q, snap => {
      setFirestoreData(snap.docs.length > 0 ? snap.docs[0].data() : null)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
  }, [slug])

  if (!VALID_SLUGS.includes(slug) && !loading && !firestoreData) {
    return <Navigate to="/404" replace />
  }

  if (!loading && firestoreData && firestoreData.active === false) {
    return <Navigate to="/404" replace />
  }

  const defaults = DEFAULT_SPORTS[slug] || DEFAULT_SPORTS['football-futsal']

  // Merge Firestore data (if it exists) with defaults
  const sport = firestoreData ? {
    ...defaults,
    name:           firestoreData.name         || defaults.name,
    emoji:          firestoreData.emoji        || defaults.emoji,
    tagline:        firestoreData.tagline      || defaults.tagline,
    description:    firestoreData.description  || defaults.description,
    facilities:     firestoreData.facilities
                      ? firestoreData.facilities.split('\n').filter(Boolean)
                      : defaults.facilities,
    pricing:        firestoreData.pricing
                      ? firestoreData.pricing.split('\n').filter(Boolean).map(line => {
                          const [plan, price] = line.split('–').map(s => s.trim())
                          return { plan, price, desc: '' }
                        })
                      : defaults.pricing,
    schedule:       firestoreData.schedule     || defaults.schedule,
    imageURL:       firestoreData.imageURL     || null,
    color:          firestoreData.color        || defaults.color,
    seoTitle:       firestoreData.seoTitle     || defaults.seoTitle,
    seoDescription: firestoreData.seoDescription || defaults.seoDescription,
    active:         firestoreData.active !== false,
  } : defaults

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: `Tiptoe Sports Hub – ${sport.name}`,
    description: sport.seoDescription,
    url: `https://tiptoesportshub.com/sports/${slug}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Tarkeshwar',
      addressLocality: 'Kathmandu',
      addressCountry: 'NP',
    },
    telephone: phone,
    openingHours: sport.schedule,
  }

  return (
    <>
      <SEOHead
        title={sport.seoTitle}
        description={sport.seoDescription}
        path={`/sports/${slug}`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      {/* HERO */}
      <section className="relative min-h-[60vh] flex items-end bg-dark overflow-hidden">
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at top right, ${sport.color}cc 0%, #030A2E 65%)` }} />
        {sport.imageURL && (
          <img src={sport.imageURL} alt={sport.name}
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pb-16 pt-36 w-full">
          <motion.div initial="hidden" animate="show" variants={stagger} className="max-w-2xl">
            <motion.div variants={fadeUp} className="text-5xl md:text-6xl mb-4">{sport.emoji}</motion.div>
            {sport.badge && (
              <motion.div variants={fadeUp}>
                <span className="badge-gold mb-4">{sport.badge}</span>
              </motion.div>
            )}
            <motion.h1 variants={fadeUp} className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-4">
              {sport.name}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 text-lg md:text-xl leading-relaxed mb-8 max-w-xl font-light">
              {sport.tagline}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/enroll" className="btn-primary py-3.5 px-7">
                Join Now <FaArrowRight size={12} />
              </Link>
              <Link to="/contact" className="btn-outline py-3.5 px-7">
                Enquire
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section-padding bg-light">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="section-label mb-2">About</motion.span>
              <motion.h2 variants={fadeUp} className="section-title mb-5">{sport.name} at Tiptoe</motion.h2>
              <motion.div variants={fadeUp} className="gold-divider mb-6" />
              <motion.p variants={fadeUp} className="text-gray-600 leading-relaxed text-base mb-6">{sport.description}</motion.p>
              {sport.schedule && (
                <motion.div variants={fadeUp} className="flex items-start gap-3 p-4 bg-navy/5 rounded-xl border border-navy/10">
                  <FaCalendarAlt className="text-navy mt-0.5 shrink-0" size={16} />
                  <div>
                    <div className="font-heading font-semibold text-navy text-sm mb-0.5">Hours & Schedule</div>
                    <div className="text-gray-500 text-sm">{sport.schedule}</div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Features */}
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sport.features.map((f, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <FaCheckCircle className="text-green shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-700 text-sm font-medium leading-snug">{f}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="section-padding bg-navy">
        <div className="container-max">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="section-label mb-2">What We Have</motion.span>
            <motion.h2 variants={fadeUp} className="section-title-white">Facilities</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Array.isArray(sport.facilities) ? sport.facilities : []).map((facility, i) => (
              <motion.div key={i} className="flex items-center gap-3 bg-white/8 border border-white/10 rounded-xl p-4"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-lg" style={{ background: `${sport.color}30` }}>
                  {sport.emoji}
                </div>
                <span className="text-white/80 text-sm font-medium">{facility}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="section-label mb-2">Membership & Pricing</motion.span>
            <motion.h2 variants={fadeUp} className="section-title">Transparent Pricing</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider mx-auto mt-4" />
            <motion.p variants={fadeUp} className="text-gray-500 mt-4 text-sm">All prices in Nepali Rupees (NPR). Contact us for group or corporate packages.</motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {(Array.isArray(sport.pricing) ? sport.pricing : []).map((p, i) => (
              <motion.div key={i} className="card p-6 text-center group hover:border-gold/30"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}>
                {p.age && <span className="badge-navy text-[10px] mb-3">{p.age}</span>}
                <div className="font-heading font-bold text-navy text-lg mt-3 mb-1 leading-tight">{p.plan}</div>
                <div className="font-heading font-extrabold text-2xl mb-2" style={{ color: sport.color }}>{p.price}</div>
                {p.desc && <div className="text-gray-400 text-xs leading-relaxed">{p.desc}</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LOCATION + CTA */}
      <section className="section-padding bg-light">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Location */}
            <motion.div className="card p-6" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 className="font-heading font-bold text-navy text-lg mb-4">Find Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-navy mt-0.5 shrink-0" size={15} />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Address</div>
                    <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 text-sm hover:text-navy transition-colors">
                      {address}
                    </a>
                  </div>
                </li>
                {phone && (
                  <li className="flex items-center gap-3">
                    <FaPhoneAlt className="text-navy shrink-0" size={13} />
                    <a href={`tel:${phone}`} className="text-gray-500 text-sm hover:text-navy transition-colors">{phone}</a>
                  </li>
                )}
                <li className="flex items-start gap-3">
                  <FaCalendarAlt className="text-navy mt-0.5 shrink-0" size={14} />
                  <div className="text-gray-500 text-sm">{sport.schedule}</div>
                </li>
              </ul>
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="mt-5 btn-outline-navy py-2.5 text-sm inline-flex">
                Get Directions <FaArrowRight size={11} />
              </a>
            </motion.div>

            {/* CTA */}
            <motion.div className="rounded-2xl p-8 flex flex-col justify-center text-center"
              style={{ background: `linear-gradient(135deg, ${sport.color} 0%, #030A2E 100%)` }}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="text-5xl mb-4">{sport.emoji}</div>
              <h3 className="font-heading font-extrabold text-white text-2xl mb-3">Ready to Start?</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Join Tiptoe Sports Hub and experience {sport.name} like never before in Kathmandu.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/enroll" className="btn-primary py-3.5 justify-center">
                  Enroll Now <FaArrowRight size={12} />
                </Link>
                <Link to="/contact" className="btn-outline py-3.5 justify-center">
                  Ask a Question
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* OTHER SPORTS */}
      <section className="py-14 bg-dark">
        <div className="container-max">
          <div className="text-center mb-8">
            <span className="section-label mb-2">Explore More</span>
            <h2 className="section-title-white text-2xl">Other Sports & Facilities</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(DEFAULT_SPORTS)
              .filter(([s]) => s !== slug)
              .map(([s, d]) => (
                <Link key={s} to={`/sports/${s}`}
                  className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-gold/30 text-white/70 hover:text-white rounded-xl px-5 py-3 text-sm font-heading font-medium transition-all duration-200">
                  <span className="text-lg">{d.emoji}</span> {d.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </>
  )
}
