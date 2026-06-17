import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaStar, FaTrophy, FaUsers, FaGlobe, FaCheckCircle } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { MdSportsSoccer } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { programsCol, coachesCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useSite } from '../contexts/SiteContext'

const STATS = [
  { value: '370+', label: 'Active Students',      Icon: FaUsers },
  { value: '27+',  label: 'Years Head Coach Exp', Icon: FaTrophy },
  { value: '5',    label: 'Training Programs',    Icon: MdSportsSoccer },
  { value: '2+',   label: "Int'l Destinations",  Icon: FaGlobe },
]

const SPORT_COLOR = {
  Football: 'bg-navy',
  Futsal:   'bg-green',
  Special:  'bg-[#c47d00]',
}

const FALLBACK_PROGRAMS = [
  { id: 'f1', name: 'Football Foundation', sport: 'Football', ageGroup: 'Age 4–10',   description: 'Foundation skills, coordination and a love for the beautiful game.', schedule: 'Mon, Wed, Fri — 3:00 PM–5:00 PM', fee: 'NPR 2,500/month', emoji: '⚽', active: true, order: 1 },
  { id: 'f2', name: 'Youth Development',   sport: 'Football', ageGroup: 'Age 11–15',  description: 'Intermediate tactical training focusing on positioning, team play and skill development.', schedule: 'Mon, Wed, Fri — 4:00 PM–6:00 PM', fee: 'NPR 3,000/month', emoji: '⚽', active: true, order: 2 },
  { id: 'f3', name: 'Elite Performance',   sport: 'Football', ageGroup: 'Age 16–18',  description: 'Elite performance program with professional-level training methodologies and match analysis.', schedule: 'Tue, Thu, Sat — 6:00 AM–8:00 AM', fee: 'NPR 3,500/month', emoji: '🏆', active: true, order: 3 },
  { id: 'fu1', name: 'Futsal Academy',     sport: 'Futsal',   ageGroup: 'All Ages',   description: 'Indoor futsal techniques, fast-paced play skills and futsal-specific tactics for all ages.', schedule: 'Tue, Thu, Sat — 4:00 PM–6:00 PM', fee: 'NPR 2,800/month', emoji: '🥅', active: true, order: 4 },
  { id: 'sp1', name: 'Girls Football',     sport: 'Special',  ageGroup: 'Age 8–18',   description: 'A dedicated program empowering girls through football. Supportive environment with female-focused coaching.', schedule: 'Mon, Wed, Fri — 3:00 PM–5:00 PM', fee: 'NPR 2,500/month', emoji: '⭐', active: true, order: 5 },
]

const FALLBACK_COACHES = [
  {
    id: 'gc', name: 'Gaurav Basnet', role: 'President & Head Coach', experience: '27+ Years', featured: true,
    achievements: ['Nepal National Futsal Team Head Coach — 3 consecutive terms', 'Former Head Coach, Manang Marshyangdi Club (A Division)', 'Led Nepal internationally: Iran, Kyrgyzstan, Mongolia', 'Co-founded Tiptoe Sports Hub in 2021'],
  },
  {
    id: 'hk', name: 'Hari Khadka', role: 'Brand Ambassador & Technical Advisor', experience: '20+ Years', featured: true,
    achievements: ["Nepal's All-Time Highest International Goal Scorer", 'Former Captain, Nepal National Football Team', "Former Head Coach, National Women's Football Team", 'Former Acting Technical Director, ANFA'],
  },
]

const ACHIEVEMENTS = [
  "Nepal's largest private football & futsal youth academy",
  '370+ students enrolled daily in structured programs',
  'Official partnership with Silie Sports Club, Thailand',
  'Students compete in Asian international tournaments',
  'Presided over by a former Japanese Olympian goalkeeper',
  '3 consecutive national futsal team coaching terms',
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } } }

export default function Academy() {
  const { academyLogoURL } = useSite()

  const programsQ = useMemo(() => query(programsCol, orderBy('order')), [])
  const { docs: programDocs, loading: programsLoading } = useCollection(programsQ)

  const ACADEMY_SPORTS = ['Football', 'Futsal', 'Special']
  const activePrograms = programDocs.filter(p => p.active !== false && ACADEMY_SPORTS.includes(p.sport))
  const programs = activePrograms.length > 0 ? activePrograms : FALLBACK_PROGRAMS

  const coachesQ = useMemo(() => query(coachesCol, orderBy('order')), [])
  const { docs: coachDocs, loading: coachesLoading } = useCollection(coachesQ)

  // Show only featured + active coaches; fall back to hardcoded two if none marked featured
  const activeCoachDocs = coachDocs.filter(c => c.active !== false)
  const hasFeatured = activeCoachDocs.some(c => c.featured === true)
  const featuredCoaches = activeCoachDocs.length > 0
    ? (hasFeatured ? activeCoachDocs.filter(c => c.featured === true) : activeCoachDocs.slice(0, 2))
    : FALLBACK_COACHES

  return (
    <>
      <SEOHead
        title="About Tiptoe Sports Academy"
        description="Tiptoe Sports Academy — Nepal's #1 private football & futsal academy in Tarkeshwar, Kathmandu. Structured programs for ages 4–18, national-level coaches, and international exposure to Thailand."
        path="/academy"
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            {academyLogoURL && (
              <motion.div variants={fadeUp} className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden p-1.5 shadow-xl">
                  <img src={academyLogoURL} alt="Tiptoe Sports Academy" className="w-full h-full object-contain"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              </motion.div>
            )}
            <motion.span variants={fadeUp} className="badge-gold mb-6">Tiptoe Sports Academy</motion.span>
            <motion.h1 variants={fadeUp} className="font-black text-5xl md:text-6xl text-white leading-tight mb-5">
              Nepal's #1<br /><span className="text-gold">Football Academy</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
              Structured youth football & futsal development for ages 4–18. National-level coaches. International exposure to Thailand. 370+ students training daily in Tarkeshwar, Kathmandu.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mt-8">
              <Link to="/enroll" className="btn-primary">
                Enroll Now <FaArrowRight size={12} />
              </Link>
              <Link to="/programs" className="btn-outline border-white/20 text-white hover:bg-white/10">
                View Programs <FaArrowRight size={12} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label, Icon }) => (
            <motion.div key={label} className="text-center"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Icon className="text-gold text-xl mx-auto mb-2 opacity-80" />
              <div className="font-black text-3xl text-white">{value}</div>
              <div className="text-white/40 text-xs font-semibold uppercase tracking-widest mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What is the Academy */}
      <section className="section-padding bg-white">
        <div className="container-max grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="section-label mb-3">What We Do</span>
            <h2 className="section-title mb-2">About the Academy</h2>
            <div className="gold-divider mb-7" />
            <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
              <p>
                <strong className="text-navy">Tiptoe Sports Academy</strong> is Nepal's leading private football and futsal development academy, operating within Tiptoe Sports Hub in Tarkeshwar, Kathmandu since 2021.
              </p>
              <p>
                We provide structured, age-appropriate training programs for young athletes aged 4 to 18. Our curriculum follows international coaching methodologies, delivered by certified coaches with decades of national and international experience.
              </p>
              <p>
                Beyond coaching, we create real international pathways. Through our official partnership with <strong className="text-navy">Silie Sports Club, Thailand</strong>, selected students participate in annual training camps, Asian championships, and trials with Thai Division clubs.
              </p>
              <p>
                We believe every child deserves access to quality football coaching. Whether your child is picking up a ball for the first time or preparing for a professional career — Tiptoe Sports Academy has the right program for them.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/enroll" className="btn-primary text-sm">
                Enroll Your Child <FaArrowRight size={12} />
              </Link>
              <Link to="/coaches" className="btn-outline text-sm">
                Meet Our Coaches <FaArrowRight size={12} />
              </Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="bg-light rounded-3xl p-8 space-y-3">
              <p className="text-navy font-bold text-base mb-5">Why Choose Tiptoe Academy?</p>
              {ACHIEVEMENTS.map((a, i) => (
                <motion.div key={i} className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <FaCheckCircle className="text-green shrink-0 mt-0.5" size={15} />
                  <span className="text-gray-600 text-sm leading-snug">{a}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Programs */}
      <section className="section-padding bg-light">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label mb-2">Training Programs</span>
            <h2 className="section-title">Find the Right Program</h2>
            <div className="gold-divider mx-auto mt-4" />
            <p className="text-gray-500 text-sm mt-4 max-w-xl mx-auto">
              Every program is designed for a specific age group and skill level. All sessions are run by certified coaches at our Tarkeshwar facility.
            </p>
          </div>
          {programsLoading ? (
            <LoadingSkeleton count={5} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {programs.map((p, i) => (
                <motion.div key={p.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <div className={`${SPORT_COLOR[p.sport] || 'bg-navy'} px-6 py-5`}>
                    <div className="text-3xl mb-2">{p.emoji || '⚽'}</div>
                    <h3 className="font-black text-white text-lg leading-tight">{p.name}</h3>
                    <p className="text-white/60 text-xs mt-1 font-semibold uppercase tracking-wide">{p.ageGroup}</p>
                  </div>
                  <div className="px-6 py-5 flex flex-col flex-1">
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>
                    {p.schedule && (
                      <p className="text-xs text-gray-400 mb-3">
                        <span className="font-semibold text-gray-500">Schedule:</span> {p.schedule}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      {p.fee && <span className="font-black text-navy text-sm">{p.fee}</span>}
                      <Link to="/enroll" className="text-xs font-bold text-gold hover:text-navy transition-colors flex items-center gap-1 ml-auto">
                        Enroll <FaArrowRight size={9} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Link to="/programs" className="btn-primary text-sm">
              View Full Program Details <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* Coaches */}
      <section className="section-padding bg-white">
        <div className="container-max">
          <div className="text-center mb-12">
            <span className="section-label mb-2">Leadership</span>
            <h2 className="section-title">Our Coaches</h2>
            <div className="gold-divider mx-auto mt-4" />
          </div>

          {coachesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {featuredCoaches.map((c, i) => {
                const achievementsArr = Array.isArray(c.achievements)
                  ? c.achievements
                  : typeof c.achievements === 'string'
                    ? c.achievements.split('\n').filter(Boolean)
                    : []
                return (
                  <motion.div key={c.id || c.name}
                    className="bg-light rounded-2xl p-7"
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                    <div className="flex items-start gap-4 mb-5">
                      {c.photoURL ? (
                        <img src={c.photoURL} alt={c.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" onError={e => e.target.style.display='none'} />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-navy flex items-center justify-center shrink-0">
                          <span className="text-gold font-black text-xl">{c.name?.[0] || '?'}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-navy text-lg leading-tight">{c.name}</h3>
                        <p className="text-gold text-xs font-semibold uppercase tracking-wide mt-0.5">{c.role}</p>
                        {c.experience && <p className="text-gray-400 text-xs mt-0.5">{c.experience} experience</p>}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {achievementsArr.slice(0, 4).map((h, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-600">
                          <FaStar className="text-gold shrink-0 mt-0.5" size={11} /> {h}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Prominent link to full coaches page */}
          <motion.div
            className="mt-10 bg-navy rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div>
              <p className="text-gold text-xs font-bold uppercase tracking-widest mb-1">Meet the Full Team</p>
              <h3 className="font-black text-white text-xl">All Coaches & Training Staff</h3>
              <p className="text-white/50 text-sm mt-1">Full bios, achievements and detailed profiles of every coach at Tiptoe Sports Academy.</p>
            </div>
            <Link to="/coaches" className="btn-primary shrink-0 whitespace-nowrap">
              View All Coaches <FaArrowRight size={12} />
            </Link>
          </motion.div>
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
            {['Training Camps in Bangkok', 'Asian Championship Participation', 'Trials with Thai Division Clubs', 'Equipment Support'].map(label => (
              <motion.div key={label}
                className="bg-white/10 border border-white/20 rounded-2xl p-5 text-center"
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <p className="font-semibold text-white text-sm leading-snug">{label}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/enroll" className="btn-primary text-sm">
              Apply for International Program <FaArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-navy text-center">
        <div className="container-max max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="badge-gold mb-6">Start Today</span>
            <h2 className="font-black text-4xl md:text-5xl text-white mb-4">
              Ready to Join the Academy?
            </h2>
            <p className="text-white/50 text-base mb-8 leading-relaxed">
              Fill out our enrollment form and we will schedule a trial session. Programs available for ages 4–18.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/enroll" className="btn-primary">
                Enroll Now <FaArrowRight size={12} />
              </Link>
              <Link to="/contact" className="btn-outline border-white/20 text-white hover:bg-white/10">
                Contact Us <FaArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
