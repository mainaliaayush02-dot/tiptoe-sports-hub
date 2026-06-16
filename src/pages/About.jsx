import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaStar, FaTrophy, FaUsers, FaGlobe } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import SEOHead from '../components/SEOHead'

const MILESTONES = [
  { year: '2021', title: 'Founded', desc: "Tiptoe Sports Hub was established in Tarkeshwar, Kathmandu with a vision to nurture Nepal's football talent from the grassroots up." },
  { year: '2023', title: 'National Recognition', desc: 'Rapid enrollment growth to 370+ daily students, establishing Tiptoe as the country\'s most trusted and recognized football academy.' },
  { year: '2025', title: 'Thailand Partnership', desc: 'Forged an official partnership with Silie Sports Club, Thailand — opening international doors and real pathways for our top students.' },
]

const STATS = [
  { value: '370+', label: 'Students Daily',  Icon: FaUsers },
  { value: '6+',   label: 'Programs',          Icon: FaGlobe },
  { value: '4+',   label: 'Years Active',     Icon: FaTrophy },
  { value: '2',    label: "Int'l Coaches",    Icon: FaStar },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } }

export default function About() {
  return (
    <>
      <SEOHead
        title="About Us"
        description="Learn about Tiptoe Sports Hub — Nepal's #1 private football and futsal academy founded in 2021. Our story, mission, vision, and international partnerships."
        path="/about"
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
              Nepal's #1 Private Football &amp; Futsal Academy — shaping champions since 2021.
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
            <span className="section-label mb-3">Our Journey</span>
            <h2 className="section-title mb-2">Welcome to Tiptoe Sports Hub</h2>
            <div className="gold-divider mb-7" />
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
              <p>Tiptoe Sports Hub is Nepal's #1 Private Football &amp; Futsal Academy. We believe in the power of sports to shape character, build discipline, and unlock potential in each individual.</p>
              <p>Based in Tarkeshwar, Kathmandu, with 370+ students training daily, we are a community dedicated to nurturing the next generation of Nepali football talent — from the very first kick to the international stage.</p>
              <p>Our academy was founded on the belief that every child in Nepal deserves access to world-class football coaching, structured development programs, and the inspiration to dream big.</p>
            </div>
            <Link to="/enroll" className="btn-primary mt-8 text-sm">
              Join the Academy <FaArrowRight size={12} />
            </Link>
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
                To nurture Nepal's next generation of football and futsal champions through world-class coaching, structured training, and international exposure opportunities.
              </p>
            </motion.div>
            <motion.div className="bg-green text-white rounded-2xl p-8" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="w-12 h-12 bg-gold rounded-xl flex items-center justify-center mb-5">
                <FaTrophy className="text-navy text-xl" />
              </div>
              <h3 className="font-black text-xl mb-4 text-gold">Our Vision</h3>
              <p className="text-white/70 leading-relaxed text-sm">
                To be Nepal's leading sports institution producing internationally competitive athletes while promoting grassroots development across the entire country.
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

      {/* International Partnership */}
      <section className="section-padding bg-green">
        <div className="container-max">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-5">
              <FaGlobe size={11} /> International Partnership
            </span>
            <h2 className="font-black text-3xl md:text-4xl text-white mt-2">Nepal × Thailand</h2>
            <p className="text-white/70 text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Official partnership with <strong className="text-white">Silie Sports Club, Thailand</strong>, presided by <strong className="text-white">Daisuke Tada</strong> — former Japanese Olympian goalkeeper. Real international doors for our students.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              ['Training Camps in Bangkok', 'Training'],
              ['Asian Championship Participation', 'Championships'],
              ['Trials with Thai Division Clubs', 'Trials'],
              ['Equipment Support', 'Support'],
            ].map(([label]) => (
              <motion.div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="font-semibold text-white text-sm leading-snug">{label}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/programs" className="btn-primary text-sm">
              Explore International Programs <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
