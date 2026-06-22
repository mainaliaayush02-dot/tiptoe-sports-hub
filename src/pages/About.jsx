import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaTrophy, FaUsers, FaCalendarAlt } from 'react-icons/fa'
import { MdSportsScore } from 'react-icons/md'
import { GiSoccerBall } from 'react-icons/gi'
import SEOHead, { BASE_URL } from '../components/SEOHead'

const MILESTONES = [
  { year: '2021', title: 'Founded', desc: 'Tiptoe Sports Hub was established in Tarkeshwar, Kathmandu with a vision to build a world-class multi-sport destination accessible to everyone in the city.' },
  { year: '2023', title: 'Full Multi-Sport Launch', desc: 'Expanded to six sports — Football, Cricket, Basketball, Pickleball, Snooker, and a Sports Lounge — becoming Kathmandu\'s most complete sports facility.' },
  { year: '2025', title: 'Community Milestone', desc: 'Reached over 1,000 monthly visitors across all sports, cementing our position as the go-to sports and leisure destination in Tarkeshwar, Kathmandu.' },
]

const STATS = [
  { value: '6',    label: 'Sports & Facilities', Icon: MdSportsScore },
  { value: '4+',   label: 'Years Active',        Icon: FaTrophy },
  { value: '7',    label: 'Days Open Per Week',  Icon: FaCalendarAlt },
  { value: '1000+',label: 'Monthly Visitors',    Icon: FaUsers },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

export default function About() {
  return (
    <>
      <SEOHead
        title="About Tiptoe Sports Hub in Kathmandu"
        description="Learn about Tiptoe Sports Hub, Kathmandu's multi-sport destination and home of Tiptoe Sports Academy, Nepal's #1 football and futsal academy in Tarkeshwar."
        path="/about"
        breadcrumb
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Tiptoe Sports Hub',
          url: BASE_URL,
          logo: `${BASE_URL}/logo.jpeg`,
          foundingDate: '2021',
          description: "Nepal's premier multi-sport destination in Tarkeshwar, Kathmandu. Football, Cricket, Basketball, Pickleball, Snooker and Sports Lounge. Home of Tiptoe Sports Academy.",
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Tarkeshwar',
            addressLocality: 'Kathmandu',
            addressCountry: 'NP',
          },
          sameAs: [
            'https://www.instagram.com/tiptoesportshub',
            'https://www.facebook.com/tiptoesportshub',
          ],
        }}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            <motion.span variants={fadeUp} className="badge-gold mb-6">Our Story</motion.span>
            <motion.h1 variants={fadeUp} className="font-black text-5xl md:text-6xl text-white leading-tight mb-5">
              About Tiptoe<br /><span className="text-gold">Sports Hub</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto">
              Kathmandu's premier multi-sport destination in Tarkeshwar. Football, Cricket, Basketball, Pickleball, Snooker and a Sports Lounge — all under one roof. Open 7 days a week.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label, Icon }) => (
            <motion.div key={label} className="text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Icon className="text-gold text-xl mx-auto mb-2 opacity-80" />
              <div className="font-black text-3xl text-white">{value}</div>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="section-padding bg-white">
        <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="section-label mb-3">Our Story</span>
            <h2 className="section-title mb-2">Welcome to Tiptoe Sports Hub</h2>
            <div className="gold-divider mb-7" />
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
              <p><strong className="text-navy">Tiptoe Sports Hub</strong> is Kathmandu's premier multi-sport destination, located in Tarkeshwar. We are a complete sports community offering Football, Cricket, Basketball, Pickleball, Snooker, and a Sports Lounge — all under one roof, open seven days a week.</p>
              <p>Our six facilities cater to every kind of visitor: the competitive athlete seeking elite coaching, the casual player booking a court for the evening, the family looking for a fun weekend out, and the sports fan catching a live match in our Sports Lounge.</p>
              <p>Tiptoe Sports Hub is also home to <strong className="text-navy">Tiptoe Sports Academy</strong> — an elite youth football and futsal development programme. <Link to="/academy" className="text-navy font-semibold hover:text-gold transition-colors">Learn more about the Academy →</Link></p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/contact" className="btn-primary text-sm">
                Book Your Slot <FaArrowRight size={12} />
              </Link>
              <Link to="/sports/football-futsal" className="btn-outline text-sm">
                Explore All Sports <FaArrowRight size={12} />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="relative bg-navy rounded-3xl aspect-video flex items-center justify-center overflow-hidden">
              <GiSoccerBall className="text-[160px] text-white/5 absolute" />
              <div className="relative text-white text-center p-8">
                <div className="font-black text-7xl text-gold">2021</div>
                <div className="text-2xl font-bold mt-2">Founded</div>
                <div className="text-white/40 text-sm mt-1 uppercase tracking-widest">Tarkeshwar, Kathmandu</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-yellow-300 to-gold" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding bg-light">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label mb-2">Purpose &amp; Direction</span>
            <h2 className="section-title">Mission &amp; Vision</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div className="bg-navy text-white rounded-2xl p-8" initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-5">
                <GiSoccerBall className="text-navy text-xl" />
              </div>
              <h3 className="font-black text-xl mb-4 text-gold">Our Mission</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                To be Kathmandu's most accessible and complete multi-sport destination — a place where everyone, from casual players to serious athletes, feels welcome and can play the sport they love.
              </p>
            </motion.div>
            <motion.div className="bg-green text-white rounded-2xl p-8" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-5">
                <FaTrophy className="text-navy text-xl" />
              </div>
              <h3 className="font-black text-xl mb-4 text-gold">Our Vision</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                To build the finest sports community in Nepal — bringing together players, families, and sports fans of every level under one roof in Tarkeshwar, Kathmandu.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="section-label mb-2">Our Growth</span>
            <h2 className="section-title">Milestones</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>
          <div className="space-y-0">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                className="flex gap-6 relative"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                {/* Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0 z-10">
                    <span className="text-navy font-black text-xs">{m.year.slice(-2)}</span>
                  </div>
                  {i < MILESTONES.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                <div className={`card p-6 flex-1 ${i < MILESTONES.length - 1 ? 'mb-6' : ''}`}>
                  <div className="text-gold font-bold text-sm uppercase tracking-wider mb-1">{m.year}</div>
                  <h3 className="font-bold text-navy text-lg mb-2">{m.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore Tiptoe Sports Hub</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/sports/football-futsal', label: 'Football & Futsal',   emoji: '⚽' },
              { to: '/sports/cricket',          label: 'Cricket',            emoji: '🏏' },
              { to: '/sports/basketball',       label: 'Basketball',         emoji: '🏀' },
              { to: '/sports/pickleball',       label: 'Pickleball',         emoji: '🎾' },
              { to: '/sports/snooker',          label: 'Snooker',            emoji: '🎱' },
              { to: '/sports/sports-lounge',    label: 'Sports Lounge',      emoji: '📺' },
              { to: '/pricing',                 label: 'Membership & Pricing', emoji: '💰' },
              { to: '/contact',                 label: 'Contact Us',         emoji: '📞' },
            ].map(({ to, label, emoji }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 bg-light hover:bg-navy hover:text-white border border-gray-200 hover:border-navy text-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 shadow-sm">
                <span>{emoji}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
