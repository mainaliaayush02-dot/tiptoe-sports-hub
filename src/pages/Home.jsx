import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FaArrowRight, FaUsers, FaCalendarAlt, FaTrophy, FaStar, FaChevronDown, FaQuoteLeft, FaGlobe } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { MdSportsScore } from 'react-icons/md'
import { query, orderBy, where, limit } from 'firebase/firestore'
import { eventsCol, galleryCol, testimonialsCol, programsCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import { useSite } from '../contexts/SiteContext'
import SEOHead from '../components/SEOHead'

const upcomingEventsQ  = query(eventsCol, where('isUpcoming', '==', true), orderBy('date'), limit(3))
const galleryPreviewQ  = query(galleryCol, orderBy('createdAt', 'desc'), limit(6))
const testimonialsQ    = query(testimonialsCol, where('visible', '==', true))
const programsQ        = query(programsCol, where('active', '==', true), orderBy('order'), limit(6))

const STATS = [
  { end: 370, suffix: '+', label: 'Students Daily',  Icon: FaUsers },
  { end: 4,   suffix: '+', label: 'Years Active',     Icon: FaCalendarAlt },
  { end: 6,   suffix: '',  label: 'Programs Offered', Icon: MdSportsScore },
  { end: 2,   suffix: '',  label: "Int'l Coaches",    Icon: FaStar },
]

const SPORTS_SHOWCASE = [
  { to: '/sports/football-futsal', emoji: '⚽', name: 'Football & Futsal', desc: 'Academy programs for ages 4–18', primary: true },
  { to: '/sports/basketball',      emoji: '🏀', name: 'Basketball',         desc: 'Courts & coaching' },
  { to: '/sports/pickleball',      emoji: '🎾', name: 'Pickleball',         desc: "Nepal's premier courts" },
  { to: '/sports/snooker',         emoji: '🎱', name: 'Snooker',            desc: 'Premium club & tables' },
  { to: '/sports/sports-bar',      emoji: '🍹', name: 'Sports Bar',         desc: 'Live sports & great vibes' },
]

const FALLBACK_PROGRAMS = [
  { name: 'Football Foundation', ageGroup: 'Age 4–10',  description: 'Building love for the game. Technical fundamentals, coordination, and fun-first training.', emoji: '⚽' },
  { name: 'Youth Development',   ageGroup: 'Age 11–15', description: 'Tactical awareness, team dynamics, and competitive preparation for future players.', emoji: '⚽' },
  { name: 'Elite Performance',   ageGroup: 'Age 16–18', description: 'High-intensity program for serious athletes targeting professional or national-level play.', emoji: '🏆' },
  { name: 'Futsal Academy',      ageGroup: 'All Ages',  description: 'Fast-paced indoor futsal mastering quick decisions, technical skills, and court vision.', emoji: '🥅' },
  { name: 'Girls Football',      ageGroup: 'Age 8–18',  description: 'Dedicated environment empowering girls with professional coaching and safe development.', emoji: '⭐' },
  { name: 'International Camps', ageGroup: 'Selected',  description: 'Thailand training camps, trials and international exposure for top performing students.', emoji: '🌏' },
]

const COACHES = [
  {
    initials: 'GB', name: 'Gaurav Basnet', role: 'President & Head Coach',
    points: ['Nepal National Futsal Head Coach – 3 terms', 'Former Manang Marshyangdi Club Coach', 'Led Nepal in Iran, Kyrgyzstan & Mongolia'],
  },
  {
    initials: 'HK', name: 'Hari Khadka', role: 'Brand Ambassador & Technical Advisor',
    points: ["Nepal's All-Time Highest International Goal Scorer", 'Former Captain, Nepal National Football Team', 'Former Acting Technical Director, ANFA'],
  },
]

const FALLBACK_TESTIMONIALS = [
  { name: 'Rajan Shrestha',  role: 'Parent',           text: 'My son has improved tremendously. The coaches are professional and truly dedicated to every student.' },
  { name: 'Priya Tamang',    role: 'Parent of Student', text: 'The structured programs helped my daughter build confidence both on and off the field. Excellent environment!' },
  { name: 'Binod Rai',       role: 'Student, Age 16',   text: "Best football academy in Kathmandu. Coach Gaurav's training is world-class and the Thailand camp was life-changing." },
  { name: 'Sunita Gurung',   role: 'Parent',            text: "Professional staff, great facilities, real international exposure. Best investment for my child's future." },
]

function Counter({ end, suffix, inView }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let c = 0
    const step = end / 80
    const t = setInterval(() => {
      c += step
      if (c >= end) { setCount(end); clearInterval(t) }
      else setCount(Math.floor(c))
    }, 20)
    return () => clearInterval(t)
  }, [inView, end])
  return <>{count}{suffix}</>
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

export default function Home() {
  const { logoURL, mapsLink } = useSite()
  const [tIdx, setTIdx] = useState(0)
  const statsRef = useRef(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-80px' })

  const { docs: events }         = useCollection(upcomingEventsQ)
  const { docs: gallery }        = useCollection(galleryPreviewQ)
  const { docs: tDocs }          = useCollection(testimonialsQ)
  const { docs: firestoreProgs } = useCollection(programsQ)

  const testimonials = tDocs.length > 0 ? tDocs : FALLBACK_TESTIMONIALS
  const programs = firestoreProgs.length > 0
    ? firestoreProgs.map(p => ({ ...p, emoji: p.emoji || '⚽' }))
    : FALLBACK_PROGRAMS

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [testimonials.length])

  return (
    <>
      <SEOHead
        description="Nepal's #1 multi-sport hub in Tarkeshwar, Kathmandu — Football, Basketball, Pickleball, Snooker & Sports Bar. 370+ students, professional coaching for ages 4–18."
        path="/"
      />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#06145F_0%,_#030A2E_70%)]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green/10 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-[0.04] pointer-events-none">
          <img src={logoURL} alt="" className="w-[600px] h-[600px] object-contain" onError={e => e.target.style.display = 'none'} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 pb-16 w-full">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="badge-gold mb-6">
                  <GiSoccerBall size={12} /> Est. 2021 &middot; Nepal's Premier Multi-Sport Hub
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] tracking-tight mb-6">
                One Hub.<br />
                <span className="text-gold">All Sports.</span>{' '}
                <span className="text-green">One Family.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-white/55 text-lg md:text-xl leading-relaxed mb-10 max-w-xl font-light">
                Football, Basketball, Pickleball, Snooker &amp; Sports Bar — all under one roof in Tarkeshwar, Kathmandu. Professional coaching for ages 4–18 with international exposure.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link to="/enroll" className="btn-primary py-4 px-8">
                  Start Training <FaArrowRight size={13} />
                </Link>
                <Link to="/programs" className="btn-outline py-4 px-8">
                  Explore Programs
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/10"
          >
            {[['370+', 'Daily Students'], ['4+', 'Years Active'], ['5', 'Sports & Facilities'], ['Thailand', 'Partnership']].map(([v, l]) => (
              <div key={l}>
                <div className="font-heading font-extrabold text-2xl text-gold">{v}</div>
                <div className="text-white/40 text-xs font-medium mt-0.5 uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.a href="#sports-section" className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <FaChevronDown className="text-white/25 text-lg" />
        </motion.a>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} className="py-14 bg-navy">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ end, suffix, label, Icon }) => (
            <motion.div key={label} className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Icon className="text-gold text-xl mx-auto mb-3 opacity-70" />
              <div className="font-heading font-extrabold text-4xl text-white mb-1">
                <Counter end={end} suffix={suffix} inView={statsInView} />
              </div>
              <div className="text-white/45 text-xs font-medium uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SPORTS & FACILITIES SHOWCASE */}
      <section id="sports-section" className="section-padding bg-dark overflow-hidden">
        <div className="container-max">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="section-label mb-2">Multi-Sport Destination</motion.span>
            <motion.h2 variants={fadeUp} className="section-title-white">All Sports. One Hub.</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider mx-auto mt-4" />
            <motion.p variants={fadeUp} className="text-white/45 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
              Kathmandu's only destination for Football, Basketball, Pickleball, Snooker, and a Sports Bar — all under one premium roof.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Football – featured wide card */}
            <motion.div
              className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-gradient-to-br from-navy to-dark border border-white/10 hover:border-gold/30 transition-all duration-300 group min-h-[280px] flex flex-col justify-end p-7"
              initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#06145F88_0%,_transparent_70%)]" />
              <span className="absolute top-5 right-5 text-7xl opacity-10">⚽</span>
              <div className="relative z-10">
                <span className="badge-gold text-[9px] mb-3">Primary Sport</span>
                <div className="text-5xl mb-3">⚽</div>
                <h3 className="font-heading font-extrabold text-white text-2xl mb-1">Football &amp; Futsal</h3>
                <p className="text-white/50 text-sm mb-5">Nepal's #1 academy &middot; Ages 4–18 &middot; Thailand camps</p>
                <Link to="/sports/football-futsal"
                  className="inline-flex items-center gap-2 bg-gold text-navy font-heading font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-yellow-400 transition-all">
                  Explore Academy <FaArrowRight size={10} />
                </Link>
              </div>
            </motion.div>

            {/* Other 4 sports */}
            <div className="lg:col-span-3 grid grid-cols-2 gap-4">
              {SPORTS_SHOWCASE.slice(1).map(({ to, emoji, name, desc }, i) => (
                <motion.div key={to}
                  className="card p-5 group hover:border-gold/20 hover:shadow-card-hover flex flex-col gap-3"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}>
                  <div className="text-3xl">{emoji}</div>
                  <div>
                    <h3 className="font-heading font-bold text-navy text-base leading-tight mb-1">{name}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
                  </div>
                  <Link to={to} className="mt-auto inline-flex items-center gap-1.5 text-navy font-heading font-semibold text-xs group-hover:text-gold transition-colors">
                    Explore <FaArrowRight size={9} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTBALL PROGRAMS */}
      <section className="section-padding bg-light">
        <div className="container-max">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="section-label mb-2">Football Academy</motion.span>
            <motion.h2 variants={fadeUp} className="section-title">Training Programs</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider mx-auto mt-4" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((prog, i) => (
              <motion.div key={prog.id || prog.name} className="card p-7 group"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.5 }}>
                <div className="text-2xl mb-4">{prog.emoji || '⚽'}</div>
                {prog.ageGroup && <span className="badge-green text-[10px] mb-3">{prog.ageGroup}</span>}
                <h3 className="font-heading font-semibold text-navy text-lg mt-2 mb-2">{prog.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{prog.description}</p>
                {prog.fee && <p className="text-green font-heading font-semibold text-sm mt-3">{prog.fee}</p>}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/programs" className="btn-outline-navy py-3">
              View All Programs <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="section-padding bg-navy">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="section-label mb-3">Why Tiptoe</motion.span>
              <motion.h2 variants={fadeUp} className="section-title-white mb-5">
                Where Nepal's Best<br />Players Are Made
              </motion.h2>
              <motion.div variants={fadeUp} className="gold-divider mb-8" />
              <motion.div variants={stagger} className="space-y-5">
                {[
                  { title: 'Professional Coaching Staff',  desc: "Led by Nepal's National Futsal Head Coach and all-time highest international goal scorer." },
                  { title: 'Based in Kathmandu',          desc: "Conveniently located in Tarkeshwar — the heart of Nepal's sports community." },
                  { title: 'International Exposure',      desc: 'Annual Thailand training camps, cross-border tournaments, and foreign club trials.' },
                  { title: 'Multi-Sport Destination',     desc: 'Football, Basketball, Pickleball, Snooker & Sports Bar — everything in one premium hub.' },
                ].map(({ title, desc }) => (
                  <motion.div key={title} variants={fadeUp} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 shrink-0" />
                    <div>
                      <div className="text-white font-heading font-semibold text-sm">{title}</div>
                      <div className="text-white/45 text-sm mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <Link to="/about" className="btn-primary py-3.5">Our Story <FaArrowRight size={12} /></Link>
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="btn-outline py-3.5">
                  Get Directions <FaArrowRight size={12} />
                </a>
              </motion.div>
            </motion.div>

            {/* Featured Coaches */}
            <div className="space-y-5">
              {COACHES.map(({ initials, name, role, points }, i) => (
                <motion.div key={name}
                  className="bg-white/5 border border-white/10 hover:border-gold/25 rounded-xl p-6 transition-all duration-300"
                  initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gold flex items-center justify-center font-heading font-extrabold text-navy text-lg shrink-0">{initials}</div>
                    <div>
                      <div className="text-white font-heading font-semibold text-base">{name}</div>
                      <div className="text-gold text-xs font-medium uppercase tracking-wider mt-0.5 mb-3">{role}</div>
                      <ul className="space-y-1.5">
                        {points.map(p => (
                          <li key={p} className="flex items-start gap-2 text-white/45 text-xs leading-relaxed">
                            <span className="text-gold shrink-0 mt-0.5">–</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
              <div className="text-center pt-2">
                <Link to="/coaches" className="text-gold hover:text-yellow-300 text-sm font-semibold transition-colors inline-flex items-center gap-1.5">
                  Meet all coaches <FaArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      {events.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-max">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-label mb-1.5">What's Coming</span>
                <h2 className="section-title">Upcoming Events</h2>
              </div>
              <Link to="/events" className="text-navy text-sm font-semibold hover:text-gold transition-colors inline-flex items-center gap-1.5">
                All Events <FaArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {events.map((ev, i) => (
                <motion.div key={ev.id} className="card overflow-hidden group"
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  {ev.bannerURL
                    ? <img src={ev.bannerURL} alt={ev.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-44 bg-navy flex items-center justify-center"><GiSoccerBall className="text-gold text-5xl opacity-20" /></div>
                  }
                  <div className="p-5">
                    <span className="badge-green text-[10px] mb-3">Upcoming</span>
                    <h3 className="font-heading font-semibold text-navy text-base mb-1 line-clamp-2">{ev.title}</h3>
                    {ev.date && <p className="text-gray-400 text-xs mt-1">{ev.date}{ev.venue ? ` · ${ev.venue}` : ''}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="section-padding bg-light">
          <div className="container-max">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-label mb-1.5">Academy Life</span>
                <h2 className="section-title">Our Gallery</h2>
              </div>
              <Link to="/gallery" className="text-navy text-sm font-semibold hover:text-gold transition-colors inline-flex items-center gap-1.5">
                View All <FaArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.slice(0, 6).map((img, i) => (
                <motion.div key={img.id} className="aspect-square rounded-xl overflow-hidden bg-gray-100"
                  initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <img src={img.url} alt={img.caption || img.category || 'Gallery'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="section-padding bg-dark overflow-hidden">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label mb-2">What Families Say</span>
            <h2 className="section-title-white">Trusted by 370+ Students</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>

          <div className="max-w-3xl mx-auto">
            <AnimatedTestimonial testimonial={testimonials[tIdx]} />
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setTIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === tIdx ? 'bg-gold w-6 h-2' : 'bg-white/20 w-2 h-2 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/testimonials" className="text-gold hover:text-yellow-300 text-sm font-semibold transition-colors inline-flex items-center gap-2">
              Read all testimonials <FaArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-green">
        <div className="container-max text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="font-heading font-extrabold text-4xl md:text-5xl text-white mb-5 leading-tight">
              Ready to Join<br />Kathmandu's Best Sports Hub?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/70 text-lg max-w-xl mx-auto mb-10">
              Football, Basketball, Pickleball, Snooker &amp; Sports Bar — all at Tarkeshwar, Kathmandu. Ages 4–18, all skill levels welcome.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enroll" className="btn-primary py-4 px-10">Enroll Now <FaArrowRight size={13} /></Link>
              <Link to="/contact" className="btn-outline py-4 px-10">Get in Touch</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function AnimatedTestimonial({ testimonial }) {
  if (!testimonial) return null
  return (
    <motion.div
      key={testimonial.name}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45 }}
      className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-10 text-center"
    >
      <FaQuoteLeft className="text-gold/30 text-2xl mx-auto mb-6" />
      <p className="text-white/75 text-lg md:text-xl leading-relaxed font-light mb-8 italic">"{testimonial.text}"</p>
      <div className="flex items-center justify-center gap-3">
        {testimonial.photoURL
          ? <img src={testimonial.photoURL} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30" />
          : <div className="w-10 h-10 rounded-full bg-navy border-2 border-gold/30 flex items-center justify-center text-gold font-heading font-bold text-sm">{testimonial.name?.[0]}</div>
        }
        <div className="text-left">
          <div className="text-white font-heading font-semibold text-sm">{testimonial.name}</div>
          <div className="text-gold text-xs font-medium">{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  )
}
