import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaFilter } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { query, orderBy } from 'firebase/firestore'
import { programsCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import LoadingSkeleton from '../components/LoadingSkeleton'

const FILTERS = ['All', 'Football', 'Futsal', 'Basketball', 'Pickleball', 'Snooker', 'Special']

const FALLBACK_PROGRAMS = [
  { id: 'f1', name: 'Football Academy', sport: 'Football', ageGroup: 'Age 4–10', description: 'Foundation skills, coordination, and a love for the beautiful game. Perfect starting point for young players.', schedule: 'Mon, Wed, Fri:5:00 PM–6:30 PM', fee: 'NPR 2,500/month', active: true },
  { id: 'f2', name: 'Football Academy', sport: 'Football', ageGroup: 'Age 11–15', description: 'Intermediate tactical training focusing on positioning, team play, and individual skill development.', schedule: 'Mon, Wed, Fri:4:00 PM–6:00 PM', fee: 'NPR 3,000/month', active: true },
  { id: 'f3', name: 'Football Academy', sport: 'Football', ageGroup: 'Age 16–18', description: 'Elite performance program with professional-level training methodologies and match analysis.', schedule: 'Tue, Thu, Sat:6:00 AM–8:00 AM', fee: 'NPR 3,500/month', active: true },
  { id: 'fu1', name: 'Futsal Academy', sport: 'Futsal', ageGroup: 'All Ages', description: 'Indoor futsal techniques, fast-paced play skills, and futsal-specific tactics for all ages.', schedule: 'Tue, Thu, Sat:4:00 PM–6:00 PM', fee: 'NPR 2,800/month', active: true },
  { id: 'sp1', name: "Girls Football Program", sport: 'Special', ageGroup: 'Age 8–18', description: 'A dedicated program empowering girls through football. Supportive environment with female-focused coaching.', schedule: 'Mon, Wed, Fri:3:00 PM–5:00 PM', fee: 'NPR 2,500/month', active: true },
  { id: 'sp2', name: 'Holiday Camps', sport: 'Special', ageGroup: 'All Ages', description: 'Intensive short-term programs during school holidays. Focus on accelerated skill development and fun.', schedule: 'Daily during school holidays: 8:00 AM–12:00 PM', fee: 'NPR 5,000/week', active: true },
  { id: 'sp3', name: 'International Exposure', sport: 'Special', ageGroup: 'Selected', description: 'Thailand training camps, Asian championship participation, and trials with Thai Division clubs for selected students.', schedule: 'Annual, Thailand (Bangkok)', fee: 'Contact for details', active: true },
]

const SPORT_GRADIENT = {
  Football: 'from-navy to-blue-800',
  Futsal: 'from-green to-emerald-700',
  Special: 'from-[#c47d00] to-gold',
}

export default function Programs() {
  const [activeFilter, setActiveFilter] = useState('All')
  const programsQ = useMemo(() => query(programsCol, orderBy('order')), [])
  const { docs, loading } = useCollection(programsQ)

  const activePrograms = docs.filter(p => p.active !== false)
  const programs = docs.length > 0 ? activePrograms : FALLBACK_PROGRAMS

  const filtered = activeFilter === 'All'
    ? programs
    : programs.filter(p => p.sport === activeFilter)

  return (
    <>
      <SEOHead
        title="Football & Futsal Training Programs in Kathmandu"
        description="Football and futsal training programs for ages 4–18 at Tiptoe Sports Academy, Tarkeshwar Kathmandu. Foundation to elite level, girls programs, and Thailand international camps."
        path="/programs"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Programs</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Football & Futsal Programs</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Structured programs for every age, from your child's first kick at age 4 to elite performance at 18, in Tarkeshwar, Kathmandu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-10 flex-wrap">
            <FaFilter className="text-gold" size={13} />
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                  activeFilter === f
                    ? 'bg-navy text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prog, i) => (
                <motion.div
                  key={prog.id}
                  className="card overflow-hidden flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className={`bg-gradient-to-br ${SPORT_GRADIENT[prog.sport] || 'from-navy to-blue-800'} p-6 text-white`}>
                    <div className="flex justify-between items-start mb-4">
                      <GiSoccerBall className="text-4xl opacity-80" />
                      <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">{prog.ageGroup}</span>
                    </div>
                    <h3 className="font-bold text-xl">{prog.name}</h3>
                    <span className={`text-xs font-semibold mt-1 inline-block ${prog.sport === 'Special' ? 'text-gold' : 'text-white/70'}`}>{prog.sport}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">{prog.description}</p>
                    {prog.schedule && (
                      <div className="text-xs text-gray-400 mb-1">
                        <span className="font-semibold text-gray-500">Schedule:</span> {prog.schedule}
                      </div>
                    )}
                    {prog.fee && (
                      <div className="text-sm font-bold text-green mt-2 mb-4">{prog.fee}</div>
                    )}
                    <Link to="/enroll" className="btn-primary text-sm py-2.5 justify-center">
                      Enroll Now <FaArrowRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <GiSoccerBall className="text-6xl text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No programs found for this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black text-3xl md:text-4xl mb-4">Not sure which program is right for you?</h2>
          <p className="text-white/65 mb-8">Contact us and our coaches will help find the perfect fit for your child.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-primary">Contact Us <FaArrowRight /></Link>
            <Link to="/enroll" className="btn-outline">Enroll Now</Link>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/coaches',   label: 'Meet Our Coaches',        emoji: '🧑‍🏫' },
              { to: '/schedule',  label: 'View Training Schedule',  emoji: '📅' },
              { to: '/pricing',   label: 'Membership & Pricing',    emoji: '💰' },
              { to: '/faq',       label: 'Frequently Asked Questions', emoji: '❓' },
              { to: '/sports/football-futsal', label: 'Football & Futsal', emoji: '⚽' },
              { to: '/enroll',    label: 'Enroll Now',              emoji: '🎯' },
            ].map(({ to, label, emoji }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 bg-white hover:bg-navy hover:text-white border border-gray-200 hover:border-navy text-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 shadow-sm">
                <span>{emoji}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
