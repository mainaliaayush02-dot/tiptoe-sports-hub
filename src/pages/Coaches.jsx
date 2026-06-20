import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaStar, FaTrophy, FaFutbol } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { coachesCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import { useSite } from '../contexts/SiteContext'
import SEOHead from '../components/SEOHead'

const FALLBACK_COACHES = [
  {
    name: 'Gaurav Basnet', role: 'President & Head Coach', experience: '27+ Years',
    bio: "With over 27 years in football, Gaurav Basnet is one of Nepal's most respected football minds. As a former coach of Manang Marshyangdi Club in Nepal's A Division and the Nepal National Futsal Team for three consecutive terms, he has brought international-level expertise to every player he has trained.",
    achievements: ['Nepal National Futsal Team Head Coach - 3 consecutive terms', 'Former Head Coach, Manang Marshyangdi Club (A Division)', 'Led Nepal internationally: Iran, Kyrgyzstan, Mongolia', 'Co-founded Tiptoe Sports Hub in 2021', 'Pioneer of structured youth football development in Nepal'],
    photoURL: '',
  },
  {
    name: 'Hari Khadka', role: 'Brand Ambassador & Technical Advisor', experience: '20+ Years',
    bio: "A living legend of Nepali football, Hari Khadka is Nepal's all-time highest international goal scorer and the former captain of the National Men's Football Team. His passion for developing the next generation of Nepali talent makes him an invaluable part of the Tiptoe Sports Hub family.",
    achievements: ["Nepal's All-Time Highest International Goal Scorer", 'Former Captain, Nepal National Football Team', "Former Head Coach, National Women's Football Team", 'Former Acting Technical Director, ANFA', 'Inspiration to an entire generation of Nepali footballers'],
    photoURL: '',
  },
]

export default function Coaches() {
  const { academyLogoURL } = useSite()
  const coachesQ = useMemo(() => query(coachesCol, orderBy('order')), [])
  const { docs, loading } = useCollection(coachesQ)

  const activeCoaches = docs.filter(c => c.active !== false)
  const coaches = docs.length > 0 ? activeCoaches : FALLBACK_COACHES

  // Featured coaches (marked in admin) always show at top in full-width layout.
  // Fall back to first 2 by order if no one has featured: true (handles old/unseeded data).
  const hasFeatured = coaches.some(c => c.featured === true)
  const featured = hasFeatured ? coaches.filter(c => c.featured === true) : coaches.slice(0, 2)
  const rest     = hasFeatured ? coaches.filter(c => c.featured !== true) : coaches.slice(2)

  return (
    <>
      <SEOHead
        title="Football Coaches in Kathmandu"
        description="Meet Tiptoe Sports Academy's coaches. Gaurav Basnet served as Nepal National Futsal Head Coach for 3 terms, and Hari Khadka is Nepal's all-time top international goal scorer."
        path="/coaches"
        breadcrumb
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Tiptoe Sports Academy Coaches',
          itemListElement: [
            {
              '@type': 'ListItem', position: 1,
              item: {
                '@type': 'Person',
                name: 'Gaurav Basnet',
                jobTitle: 'President & Head Coach',
                description: 'Nepal National Futsal Team Head Coach for 3 consecutive terms. Co-founder of Tiptoe Sports Hub. 27+ years in football.',
                worksFor: { '@type': 'Organization', name: 'Tiptoe Sports Academy' },
              },
            },
            {
              '@type': 'ListItem', position: 2,
              item: {
                '@type': 'Person',
                name: 'Hari Khadka',
                jobTitle: 'Brand Ambassador & Technical Advisor',
                description: "Nepal's all-time highest international goal scorer and former captain of the Nepal National Football Team.",
                worksFor: { '@type': 'Organization', name: 'Tiptoe Sports Academy' },
              },
            },
          ],
        }}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            {academyLogoURL && (
              <img src={academyLogoURL} alt="Tiptoe Sports Academy" className="w-20 h-20 object-contain mx-auto mb-4 drop-shadow-lg"
                onError={e => e.target.style.display = 'none'} />
            )}
            <span className="badge-gold mb-5">Tiptoe Sports Academy</span>
            <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Football Coaches in Kathmandu</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Learn from Nepal's finest coaches, people who have represented the country on the international stage and now give everything to develop the next generation at Tiptoe Sports Academy.
            </p>
          </motion.div>
        </div>
      </section>

      <AnimatePresence mode="wait">
      {loading ? (
        <motion.section
          key="coaches-skel"
          className="py-20 px-4 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="max-w-7xl mx-auto space-y-10">
            {[1, 2].map(i => (
              <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="aspect-square max-w-sm mx-auto w-full rounded-2xl bg-gray-100 animate-pulse" />
                <div className="space-y-4 py-8">
                  <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                  <div className="h-8 bg-gray-100 rounded w-2/3 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                  <div className="h-24 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      ) : (
        <motion.div
          key="coaches-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
        >

      {/* Featured Coaches (first 2 from Firestore) */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            {featured.map((coach, i) => {
              const initial = coach.name?.[0] || '?'
              const achievementsArr = Array.isArray(coach.achievements)
                ? coach.achievements
                : typeof coach.achievements === 'string'
                  ? coach.achievements.split('\n').filter(Boolean)
                  : []

              return (
                <motion.div
                  key={coach.id || coach.name}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.1 }}
                >
                  {/* Photo / Avatar */}
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="relative bg-gradient-to-br from-navy to-green rounded-2xl aspect-square max-w-sm mx-auto flex items-center justify-center overflow-hidden">
                      {/* Avatar always visible as fallback */}
                      <div className="text-[180px] font-black text-white/10 select-none">{initial}</div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-28 h-28 rounded-full bg-gold flex items-center justify-center font-heading font-extrabold text-navy text-4xl mb-4">
                          {initial}
                        </div>
                        <p className="text-white font-heading font-bold text-xl text-center px-4">{coach.name}</p>
                        <p className="text-gold text-sm mt-1 text-center px-4">{coach.role}</p>
                      </div>
                      {/* Photo overlaid — hides on error so avatar shows through */}
                      {coach.photoURL && (
                        <img
                          src={coach.photoURL}
                          alt={coach.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                    {coach.experience && (
                      <span className="text-gold font-bold text-xs uppercase tracking-widest">{coach.experience} Experience</span>
                    )}
                    <h2 className="font-heading font-extrabold text-3xl text-navy mt-2 mb-1">{coach.name}</h2>
                    <p className="text-green font-semibold mb-5">{coach.role}</p>
                    {coach.bio && <p className="text-gray-600 leading-relaxed mb-6">{coach.bio}</p>}
                    {achievementsArr.length > 0 && (
                      <div>
                        <h4 className="font-bold text-navy mb-3 flex items-center gap-2">
                          <FaTrophy className="text-gold" /> Key Achievements
                        </h4>
                        <div className="space-y-2.5">
                          {achievementsArr.map((a, j) => (
                            <div key={j} className="flex items-start gap-3 text-sm text-gray-600">
                              <FaStar className="text-gold mt-0.5 shrink-0" />
                              <span>{a}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

      {/* Additional Coaches (3rd onwards) */}
      {rest.length > 0 && (
        <section className="py-20 px-4 bg-light">
          <div className="max-w-7xl mx-auto">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <span className="section-label mb-2">Training Staff</span>
              <h2 className="section-title">Our Coaches</h2>
              <div className="gold-divider mx-auto mt-4" />
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((coach, i) => {
                const initial = coach.name?.[0] || '?'
                const achievementsArr = Array.isArray(coach.achievements)
                  ? coach.achievements
                  : typeof coach.achievements === 'string'
                    ? coach.achievements.split('\n').filter(Boolean)
                    : []
                return (
                  <motion.div key={coach.id || coach.name} className="card p-6 text-center"
                    initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                    <div className="relative w-24 h-24 rounded-full mx-auto mb-4">
                      <div className="w-24 h-24 rounded-full bg-navy flex items-center justify-center font-heading font-extrabold text-gold text-2xl">
                        {initial}
                      </div>
                      {coach.photoURL && (
                        <img
                          src={coach.photoURL}
                          alt={coach.name}
                          className="absolute inset-0 w-24 h-24 rounded-full object-cover ring-4 ring-gold/30"
                          onError={e => e.target.style.display = 'none'}
                        />
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-navy text-lg">{coach.name}</h3>
                    <p className="text-green text-sm mt-1 mb-3">{coach.role}</p>
                    {coach.experience && <p className="text-gold text-xs font-semibold mb-3">{coach.experience}</p>}
                    {coach.bio && <p className="text-gray-500 text-sm leading-relaxed mb-4">{coach.bio}</p>}
                    {achievementsArr.map((a, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-gray-500 mb-1.5 text-left">
                        <FaStar className="text-gold shrink-0" /> {a}
                      </div>
                    ))}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <FaFutbol className="text-5xl text-gold mx-auto mb-4" />
          <h2 className="font-heading font-extrabold text-3xl mb-4">Train with Nepal's Best</h2>
          <p className="text-white/65 mb-8">Enroll today and start learning from coaches who've represented Nepal on the world stage.</p>
          <Link to="/enroll" className="btn-primary">Enroll Now <FaArrowRight /></Link>
        </div>
      </section>
    </>
  )
}
