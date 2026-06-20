import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { pricingCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead, { BASE_URL } from '../components/SEOHead'
import ContentLoader from '../components/ContentLoader'

const SPORT_TABS = ['All', 'Football', 'Cricket', 'Basketball', 'Pickleball', 'Snooker', 'Sports Bar']

const SPORT_COLORS = {
  Football:     '#06145F',
  Cricket:      '#1B5E20',
  Basketball:   '#B85A00',
  Pickleball:   '#1B7F5E',
  Snooker:      '#2D7D46',
  'Sports Bar': '#8B4A00',
  General:      '#06145F',
}

const FALLBACK_PRICING = [
  // Football
  { id: 'f1', sport: 'Football', title: 'Football Foundation', price: 'NPR 2,500', period: '/month', badge: '', features: ['3 sessions/week', 'Age 4–10', 'Foundation skills & fun', 'Certified coaching', 'Kit provided'] },
  { id: 'f2', sport: 'Football', title: 'Youth Development', price: 'NPR 3,000', period: '/month', badge: 'Popular', features: ['3 sessions/week', 'Age 11–15', 'Tactical & competitive prep', 'Match analysis', 'Certified coaching'] },
  { id: 'f3', sport: 'Football', title: 'Elite Performance', price: 'NPR 3,500', period: '/month', badge: '', features: ['5 sessions/week', 'Age 16–18', 'High-intensity professional track', 'International exposure', 'Video analysis'] },
  { id: 'f4', sport: 'Football', title: 'Futsal Academy', price: 'NPR 2,800', period: '/month', badge: '', features: ['3 sessions/week', 'All ages', 'Indoor futsal specific', 'Certified coaching'] },
  { id: 'f5', sport: 'Football', title: 'Girls Football', price: 'NPR 2,500', period: '/month', badge: '', features: ['3 sessions/week', 'Age 8–18', 'Female-focused coaching', 'Safe supportive environment'] },
  // Cricket
  { id: 'c1', sport: 'Cricket', title: 'Ground Hire', price: 'NPR 3,000', period: '/session', badge: '', features: ['Full ground (2 hrs)', 'Professional pitch', 'Changing rooms included', 'Equipment available'] },
  { id: 'c2', sport: 'Cricket', title: 'Net Practice', price: 'NPR 800', period: '/hr', badge: '', features: ['Batting nets (4 lanes)', 'Equipment available', 'Bowling machine access'] },
  { id: 'c3', sport: 'Cricket', title: 'Coaching Program', price: 'NPR 4,000', period: '/month', badge: 'Popular', features: ['All ages', 'Skill tracking', 'Professional coaches', 'Video analysis'] },
  { id: 'c4', sport: 'Cricket', title: 'Youth Academy', price: 'NPR 3,500', period: '/month', badge: '', features: ['Age 8–18', 'Structured development', 'Tournament preparation', 'Kit included'] },
  // Basketball
  { id: 'b1', sport: 'Basketball', title: 'Court Hire', price: 'NPR 1,500', period: '/hr', badge: '', features: ['Full court access', 'Walk-ins welcome', 'Ball included'] },
  { id: 'b2', sport: 'Basketball', title: 'Monthly Membership', price: 'NPR 4,000', period: '/month', badge: 'Popular', features: ['Unlimited court access', 'All ages', 'Locker room access', 'Open play hours'] },
  { id: 'b3', sport: 'Basketball', title: 'Coaching Program', price: 'NPR 3,500', period: '/month', badge: '', features: ['Coached sessions', 'Skill tracking', 'Tue, Thu, Sat 5PM–7PM', 'All skill levels'] },
  { id: 'b4', sport: 'Basketball', title: 'Team Package', price: 'NPR 6,000', period: '/month', badge: '', features: ['5+ players', 'Dedicated court time', 'Coach feedback sessions', 'Tournament support'] },
  // Pickleball
  { id: 'p1', sport: 'Pickleball', title: 'Court Hire', price: 'NPR 1,200', period: '/hr', badge: '', features: ['Paddles & balls included', 'Walk-ins welcome', 'Professional courts'] },
  { id: 'p2', sport: 'Pickleball', title: 'Monthly Access', price: 'NPR 3,500', period: '/month', badge: 'Popular', features: ['Unlimited court access', 'All ages', 'Equipment included', 'Open play hours'] },
  { id: 'p3', sport: 'Pickleball', title: 'Coaching Package', price: 'NPR 4,000', period: '/month', badge: '', features: ['8 coached sessions/month', 'Beginner-friendly', 'Professional coach'] },
  { id: 'p4', sport: 'Pickleball', title: 'Tournament Entry', price: 'NPR 500', period: '/event', badge: '', features: ['Members only', 'Monthly competitive events', 'Prizes available'] },
  // Snooker
  { id: 's1', sport: 'Snooker', title: 'Table Hire', price: 'NPR 800', period: '/hr', badge: '', features: ['Professional tables', 'Cues & chalk included', 'Walk-ins welcome'] },
  { id: 's2', sport: 'Snooker', title: 'Monthly Member', price: 'NPR 3,000', period: '/month', badge: 'Popular', features: ['Unlimited play', 'Priority booking', 'Club atmosphere', 'Lounge access'] },
  { id: 's3', sport: 'Snooker', title: 'VIP Membership', price: 'NPR 5,000', period: '/month', badge: 'Best Value', features: ['Priority booking', 'Lounge access', 'Exclusive events', 'Guest passes'] },
  { id: 's4', sport: 'Snooker', title: 'Day Pass', price: 'NPR 400', period: '/day', badge: '', features: ['Full day access', 'Equipment included', 'Walk-in friendly'] },
  // Sports Bar
  { id: 'sb1', sport: 'Sports Bar', title: 'Walk-In', price: 'Free entry', period: '', badge: '', features: ['With minimum drink purchase', 'Live sports on big screens', 'Full drinks & food menu'] },
  { id: 'sb2', sport: 'Sports Bar', title: 'VIP Table', price: 'NPR 2,000', period: 'min spend', badge: 'Popular', features: ['Reserved seating for 4', 'Priority service', 'All major sports events', 'Dedicated server'] },
  { id: 'sb3', sport: 'Sports Bar', title: 'Private Event', price: 'Contact us', period: '', badge: '', features: ['Up to 50 guests', 'Exclusive venue hire', 'Full catering available', 'Live sports screen'] },
]

const RELATED_LINKS = [
  { to: '/programs', label: 'View Academy Programs', emoji: '📋' },
  { to: '/sports/football-futsal', label: 'Football & Futsal', emoji: '⚽' },
  { to: '/sports/cricket', label: 'Cricket', emoji: '🏏' },
  { to: '/faq', label: 'Frequently Asked Questions', emoji: '❓' },
  { to: '/enroll', label: 'Enroll Now', emoji: '🎯' },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55 } } }

export default function Pricing() {
  const [tab, setTab] = useState('All')
  const q = useMemo(() => query(pricingCol, orderBy('order')), [])
  const { docs, loading } = useCollection(q)

  const activeDocs = docs.filter(p => p.active !== false)
  const plans = activeDocs.length > 0 ? activeDocs : FALLBACK_PRICING
  const filtered = tab === 'All' ? plans : plans.filter(p => p.sport === tab)

  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Tiptoe Sports Hub Membership & Pricing',
    description: 'Pricing plans for Football, Cricket, Basketball, Pickleball, Snooker, and Sports Bar at Tiptoe Sports Hub, Kathmandu',
    url: `${BASE_URL}/pricing`,
    itemListElement: FALLBACK_PRICING.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${p.sport}: ${p.title}`,
      description: `${p.price}${p.period ? ' ' + p.period : ''}${p.features?.length ? ' · ' + p.features[0] : ''}`,
    })),
  }

  return (
    <>
      <SEOHead
        title="Sports Membership & Pricing in Kathmandu"
        description="Transparent pricing for Football, Cricket, Basketball, Pickleball, Snooker and Sports Bar at Tiptoe Sports Hub in Kathmandu. NPR pricing, no hidden fees."
        path="/pricing"
        breadcrumb
        schema={pricingSchema}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Pricing</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Membership & Pricing</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Transparent pricing for every sport. No hidden fees. All prices in Nepali Rupees (NPR).
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sport Tabs */}
      <section className="py-6 px-4 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {SPORT_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${tab === t ? 'bg-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Cards Grid */}
      <section className="py-16 px-4 bg-light min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <ContentLoader loading={loading} count={8} skeleton={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-56 bg-white rounded-2xl animate-pulse" />)}
            </div>
          }>
            {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((plan, i) => {
                const color = SPORT_COLORS[plan.sport] || '#06145F'
                return (
                  <motion.div
                    key={plan.id}
                    className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${plan.badge === 'Popular' ? 'ring-2 ring-gold/40' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.06 }}
                  >
                    {/* Top color bar */}
                    <div className="h-1.5 w-full" style={{ background: color }} />

                    <div className="p-5 flex flex-col flex-1">
                      {/* Badge + Sport */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{plan.sport}</span>
                        {plan.badge && (
                          <span className="text-[10px] font-bold bg-gold/20 text-[#c47d00] px-2 py-0.5 rounded-full">{plan.badge}</span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="font-heading font-bold text-navy text-base leading-tight mb-3">{plan.title}</h3>

                      {/* Price */}
                      <div className="mb-4">
                        <span className="font-heading font-extrabold text-2xl" style={{ color }}>{plan.price}</span>
                        {plan.period && <span className="text-gray-400 text-sm ml-1">{plan.period}</span>}
                      </div>

                      {/* Features */}
                      {Array.isArray(plan.features) && plan.features.length > 0 && (
                        <ul className="space-y-1.5 flex-1 mb-5">
                          {plan.features.map((f, fi) => (
                            <li key={fi} className="flex items-start gap-2 text-xs text-gray-600">
                              <FaCheckCircle className="text-green shrink-0 mt-0.5" size={11} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link to="/enroll"
                        className="mt-auto text-center text-xs font-bold py-2.5 rounded-xl border-2 transition-all hover:text-white"
                        style={{ borderColor: color, color, '--hover-bg': color }}
                        onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff' }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = color }}>
                        Enroll / Book
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg font-semibold">No plans found for this category.</p>
              </div>
            )}
          </ContentLoader>

          <p className="text-center text-gray-400 text-sm mt-10">
            All prices in Nepali Rupees (NPR). Contact us for group, corporate, or seasonal packages.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white text-center">
        <div className="max-w-2xl mx-auto">
          <motion.div initial={fadeUp.hidden} whileInView={fadeUp.show} viewport={{ once: true }}>
            <span className="badge-gold mb-4">Get Started</span>
            <h2 className="font-heading font-extrabold text-3xl md:text-4xl mb-4 mt-3">Ready to Join?</h2>
            <p className="text-white/60 mb-8 text-base">Fill in our enrollment form and we'll get back to you within 24 hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/enroll" className="btn-primary py-3.5 px-8">
                Enroll Now <FaArrowRight size={12} />
              </Link>
              <Link to="/contact" className="btn-outline py-3.5 px-8">
                Ask a Question
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {RELATED_LINKS.map(({ to, label, emoji }) => (
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
