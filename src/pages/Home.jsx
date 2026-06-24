import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { FaArrowRight, FaCalendarAlt, FaChevronDown, FaQuoteLeft, FaUsers, FaDoorOpen } from 'react-icons/fa'
import { MdSportsScore } from 'react-icons/md'
import { GiSoccerBall } from 'react-icons/gi'
import { query, orderBy, limit } from 'firebase/firestore'
import { eventsCol, galleryCol, testimonialsCol, boardMembersCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import { useSite } from '../contexts/SiteContext'
import SEOHead from '../components/SEOHead'

const eventsPreviewQ      = query(eventsCol, orderBy('date'))
const galleryPreviewQ     = query(galleryCol, orderBy('createdAt', 'desc'), limit(6))
const testimonialsQ       = query(testimonialsCol, orderBy('createdAt', 'desc'))
const boardMembersQ       = query(boardMembersCol, orderBy('order'))

// Hub-relevant stats — not academy numbers
const HUB_STATS = [
  { end: 6,    suffix: '',   label: 'Sports & Facilities', Icon: MdSportsScore },
  { end: 4,    suffix: '+',  label: 'Years Active',        Icon: FaCalendarAlt },
  { end: 1000, suffix: '+',  label: 'Monthly Visitors',    Icon: FaUsers },
  { end: 7,    suffix: '',   label: 'Days Open Per Week',  Icon: FaDoorOpen },
]


const FALLBACK_BOARD = [
  { id: 'b1', name: 'Gaurav Basnet',   title: 'President & Co-Founder',         bio: 'Co-founder of Tiptoe Sports Hub. Nepal National Futsal Head Coach for three consecutive terms and one of Nepal\'s most respected football minds.',      photoURL: '' },
  { id: 'b2', name: 'Hari Khadka',     title: 'Brand Ambassador',               bio: "Nepal's all-time highest international goal scorer and former captain of the Nepal National Football Team. Technical advisor to the Hub.",                  photoURL: '' },
  { id: 'b3', name: 'Board Member',    title: 'Director – Operations',          bio: 'Oversees day-to-day operations, facilities management, and staff development across all six sports verticals at Tiptoe Sports Hub.',                       photoURL: '' },
  { id: 'b4', name: 'Board Member',    title: 'Director – Finance',             bio: 'Responsible for financial planning, budgeting, and sustainable growth strategy for Tiptoe Sports Hub in Tarakeshwar, Kathmandu.',                           photoURL: '' },
  { id: 'b5', name: 'Board Member',    title: 'Director – Community Relations', bio: 'Drives community engagement, partnerships, and outreach programmes that connect the Hub with schools, clubs, and sports organisations across Kathmandu.',   photoURL: '' },
]

const FALLBACK_TESTIMONIALS = [
  { name: 'Rajan Shrestha',  role: 'Member',           text: 'The facilities at Tiptoe are world-class. Basketball court, snooker tables, and the lounge — everything is premium quality.' },
  { name: 'Priya Tamang',    role: 'Visitor',           text: 'Brought my family for the pickleball courts and stayed for the Sports Lounge. Amazing atmosphere and friendly staff!' },
  { name: 'Binod Rai',       role: 'Cricket Member',    text: 'Best cricket ground in Kathmandu. The pitch quality and net practice facilities are excellent. Highly recommend.' },
  { name: 'Sunita Gurung',   role: 'Member',            text: 'Love the variety here — basketball in the morning, snooker in the evening, and live match screening at night. One hub does it all.' },
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

  const { docs: allEvents }  = useCollection(eventsPreviewQ)
  const { docs: gallery }    = useCollection(galleryPreviewQ)
  const { docs: tDocs }      = useCollection(testimonialsQ)
  const { docs: boardDocs, loading: boardLoading } = useCollection(boardMembersQ)

  const events = allEvents.filter(e => e.isUpcoming === true).slice(0, 3)
  const activeTestimonials = tDocs.filter(t => t.visible !== false)
  const testimonials = tDocs.length > 0 ? activeTestimonials : FALLBACK_TESTIMONIALS
  const activeBoard = boardDocs.filter(m => m.active !== false)
  const boardMembers = activeBoard.length > 0 ? activeBoard : FALLBACK_BOARD

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [testimonials.length])

  return (
    <>
      <SEOHead
        title="Multi-Sport Hub & Facilities in Kathmandu"
        description="Six sports in Tarakeshwar, Kathmandu. Football, Cricket, Basketball, Pickleball, Snooker & Sports Lounge. Nepal's #1 football academy. Open daily."
        path="/"
      />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center bg-dark overflow-hidden">

        <img
          src="/ground.jpg"
          alt="Tiptoe Sports Hub multi-sport facility in Tarakeshwar, Kathmandu"
          width="800"
          height="1066"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
          style={{ opacity: 0.45 }}
          loading="eager"
          fetchpriority="high"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #030A2E 38%, #030A2Ecc 55%, #030A2E55 75%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, #030A2Eaa 0%, transparent 30%, transparent 70%, #030A2Ecc 100%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 pt-28 pb-16 w-full">
          <div className="max-w-3xl">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp}>
                <span className="badge-gold mb-6">
                  <GiSoccerBall size={12} /> Est. 2021 · Tarakeshwar, Kathmandu
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl text-white leading-[1.05] tracking-tight mb-6">
                <span className="sr-only">Multi-Sport Hub in Tarakeshwar, Kathmandu. </span>
                One Hub.<br />
                <span className="text-gold">All Sports.</span>{' '}
                <span className="text-green">One Family.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-white/55 text-lg md:text-xl leading-relaxed mb-6 max-w-xl font-light">
                Tiptoe Sports Hub brings Football, Cricket, Basketball, Pickleball, Snooker and a Sports Lounge together under one roof in Tarakeshwar, Kathmandu. Open seven days a week for players and families of all skill levels.
              </motion.p>
              <motion.p variants={fadeUp} className="text-white/40 text-base leading-relaxed mb-10 max-w-xl font-light">
                Whether you are booking a football ground, a cricket net, a basketball court or a pickleball session — or simply joining friends in the Sports Lounge for a live match — Tiptoe Sports Hub is Kathmandu's home for sport.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="btn-primary py-4 px-8">
                  Book Your Slot <FaArrowRight size={13} />
                </Link>
                <Link to="/sports/football-futsal" className="btn-outline py-4 px-8">
                  Explore Facilities
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick stats row — Hub stats only */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-8 mt-16 pt-10 border-t border-white/10"
          >
            {[['6', 'Sports & Facilities'], ['4+', 'Years Active'], ['7 Days', 'Open Per Week'], ['Tarakeshwar', 'Kathmandu']].map(([v, l]) => (
              <div key={l}>
                <div className="font-heading font-extrabold text-2xl text-gold">{v}</div>
                <div className="text-white/40 text-xs font-medium mt-0.5 uppercase tracking-wider">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.button
          onClick={() => document.getElementById('board-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          aria-label="Scroll down">
          <FaChevronDown className="text-white/25 text-lg" />
        </motion.button>
      </section>

      {/* STATS BAR */}
      <section ref={statsRef} className="py-14 bg-navy">
        <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {HUB_STATS.map(({ end, suffix, label, Icon }) => (
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

      {/* BOARD OF DIRECTORS */}
      <section id="board-section" className="section-padding bg-white">
        <div className="container-max">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.span variants={fadeUp} className="section-label mb-2">Leadership</motion.span>
            <motion.h2 variants={fadeUp} className="section-title">Board of Directors</motion.h2>
            <motion.div variants={fadeUp} className="gold-divider mx-auto mt-4" />
            <motion.p variants={fadeUp} className="text-gray-500 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              The people behind Tiptoe Sports Hub — guiding our mission to build Kathmandu's finest multi-sport destination in Tarakeshwar.
            </motion.p>
          </motion.div>

          {boardLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl h-72 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boardMembers.map((member, i) => {
                const initials = (member.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <motion.div key={member.id || member.name}
                    className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <div className="flex items-center gap-4 mb-5">
                      {member.photoURL
                        ? <img
                            src={member.photoURL}
                            alt={`${member.name} – ${member.title} at Tiptoe Sports Hub Kathmandu`}
                            className="w-16 h-16 rounded-full object-cover ring-2 ring-gold/20 shrink-0"
                            loading="lazy"
                            onError={e => { e.target.style.display = 'none' }}
                          />
                        : <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center font-heading font-extrabold text-gold text-xl shrink-0">
                            {initials || '?'}
                          </div>
                      }
                      <div>
                        <div className="font-heading font-bold text-navy text-base leading-tight">{member.name}</div>
                        <div className="text-gold text-xs font-semibold uppercase tracking-wider mt-0.5">{member.title}</div>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">{member.bio}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* WHY TIPTOE — Hub-focused reasons */}
      <section className="section-padding bg-navy">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="section-label mb-3">Why Tiptoe</motion.span>
              <motion.h2 variants={fadeUp} className="section-title-white mb-5">
                Kathmandu's Home<br />For Every Sport
              </motion.h2>
              <motion.div variants={fadeUp} className="gold-divider mb-8" />
              <motion.div variants={stagger} className="space-y-5">
                {[
                  { title: '6 Sports Under One Roof',      desc: 'Football, Cricket, Basketball, Pickleball, Snooker and a Sports Lounge — the most complete multi-sport facility in Kathmandu.' },
                  { title: 'Conveniently in Tarakeshwar',   desc: 'Located in Tarakeshwar, Kathmandu — easily accessible from Ring Road with on-site parking for all visitors.' },
                  { title: 'Open Every Day',               desc: 'We are open 7 days a week so you can play on your schedule, not ours. Morning to evening across all sports.' },
                  { title: 'Premium Facilities',           desc: 'Professional-grade courts, tables, pitches and equipment maintained to the highest standard for the best experience.' },
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

            {/* Hub facility highlights — each links to its sport page */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { to: '/sports/football-futsal', emoji: '⚽', label: 'Football Ground',   sub: 'Full-size & futsal' },
                { to: '/sports/cricket',          emoji: '🏏', label: 'Cricket Nets',      sub: 'Batting & bowling' },
                { to: '/sports/basketball',       emoji: '🏀', label: 'Basketball Courts', sub: 'Indoor & outdoor' },
                { to: '/sports/pickleball',       emoji: '🎾', label: 'Pickleball Courts', sub: "Nepal's finest" },
                { to: '/sports/snooker',          emoji: '🎱', label: 'Snooker Tables',    sub: 'Pro-grade tables' },
                { to: '/sports/sports-lounge',    emoji: '📺', label: 'Sports Lounge',     sub: 'Live screenings' },
              ].map(({ to, emoji, label, sub }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <Link to={to}
                    className="block bg-white/5 border border-white/10 hover:border-gold/40 hover:bg-white/10 rounded-xl p-4 text-center transition-all duration-300 group">
                    <div className="text-3xl mb-2">{emoji}</div>
                    <div className="text-white font-heading font-semibold text-sm group-hover:text-gold transition-colors">{label}</div>
                    <div className="text-white/35 text-xs mt-0.5">{sub}</div>
                  </Link>
                </motion.div>
              ))}
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
                    ? <img src={ev.bannerURL} alt={ev.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
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
                <span className="section-label mb-1.5">At Tiptoe Sports Hub</span>
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
                  <img src={img.url} alt={img.alt || img.caption || 'Tiptoe Sports Hub Kathmandu'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
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
            <span className="section-label mb-2">Member Stories</span>
            <h2 className="section-title-white">Trusted by Kathmandu</h2>
            <div className="gold-divider mx-auto mt-4" />
            {/* Google Maps rating badge */}
            <a
              href="https://maps.app.goo.gl/GXdjUV3qQX4Rm61o7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-5 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full transition-all"
            >
              <span className="text-gold">★★★★★</span>
              <span>4.6 on Google Maps</span>
              <span className="text-white/50 text-xs font-normal">(20 reviews)</span>
            </a>
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
              Read all reviews <FaArrowRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      {/* VISIT US */}
      <section className="section-padding bg-light">
        <div className="container-max max-w-3xl mx-auto text-center">
          <span className="section-label mb-2">Find Us</span>
          <h2 className="section-title mb-4">Visit Tiptoe Sports Hub</h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-gray-500 text-base leading-relaxed mb-4">
            Tiptoe Sports Hub is located in <strong className="text-navy">Tarakeshwar, Kathmandu 44600, Nepal</strong>. We are open <strong className="text-navy">every day from 6 AM to 9 PM</strong> — including weekends and public holidays. Our facility is easily accessible from Ring Road with on-site parking for two-wheelers and four-wheelers.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            To book a court, reserve a ground slot, enroll in the football academy, or simply ask a question, call us on <a href="tel:+977-984-1416893" className="text-navy font-semibold hover:text-gold transition-colors">+977-984-1416893</a> or <a href="tel:+977-970-7079773" className="text-navy font-semibold hover:text-gold transition-colors">+977-970-7079773</a>. You can also reach us by WhatsApp or use the contact form on our <Link to="/contact" className="text-navy font-semibold hover:text-gold transition-colors">Contact page</Link>.
          </p>
          <address className="not-italic text-gray-400 text-sm mb-6">
            Tiptoe Sports Hub &nbsp;·&nbsp; Tarakeshwar, Kathmandu 44600, Nepal<br />
            Phone: +977-984-1416893 &nbsp;·&nbsp; +977-970-7079773<br />
            Email: tiptoesportshub@gmail.com
          </address>
          <a href="https://maps.app.goo.gl/GXdjUV3qQX4Rm61o7" target="_blank" rel="noopener noreferrer"
            className="btn-primary inline-flex">
            Get Directions <FaArrowRight size={12} />
          </a>
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
              Six sports, premium facilities, open every day at Tarakeshwar, Kathmandu. Walk in or book your slot today.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary py-4 px-10">Book Your Slot <FaArrowRight size={13} /></Link>
              <Link to="/pricing"  className="btn-outline py-4 px-10">View Pricing</Link>
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
          ? <img src={testimonial.photoURL} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30" loading="lazy" />
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
