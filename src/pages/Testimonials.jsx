import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaStar, FaQuoteLeft, FaArrowRight } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { testimonialsCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'

const visibleQ = query(testimonialsCol, orderBy('createdAt', 'desc'))

const FALLBACK = [
  { id: '1', name: 'Rajan Shrestha', role: 'Parent', text: 'My son has improved tremendously since joining Tiptoe Sports Hub. The coaches are professional and truly dedicated to each student. I can see the discipline and confidence building every week.', rating: 5 },
  { id: '2', name: 'Priya Tamang', role: 'Parent of Student (Age 10)', text: 'Excellent training environment for kids. The structured programs helped my daughter build confidence both on and off the field. The coaches make every session fun yet disciplined.', rating: 5 },
  { id: '3', name: 'Binod Rai', role: 'Student, Age 16', text: "Best football academy in Kathmandu. Coach Gaurav's training methods are world-class and the Thailand exchange program was truly life-changing. I got to train with Thai Division clubs!", rating: 5 },
  { id: '4', name: 'Sunita Gurung', role: 'Parent', text: 'Professional staff, great facilities, and real international exposure. Tiptoe Sports Hub is the best investment for my child\'s future. Highly recommended to every football-loving family.', rating: 5 },
  { id: '5', name: 'Dipak Lama', role: 'Parent of Student (Age 14)', text: 'The coaches here genuinely care about each student\'s development. My son went from a complete beginner to playing in local tournaments within 8 months. Outstanding results!', rating: 5 },
  { id: '6', name: 'Anita Karki', role: 'Parent', text: 'As a parent of a girl footballer, I\'m especially grateful for the Girls Football Program. My daughter feels completely supported and empowered. The academy has been transformational.', rating: 5 },
]

export default function Testimonials() {
  const { docs, loading } = useCollection(visibleQ)
  const activeTestimonials = docs.filter(t => t.visible !== false)
  const testimonials = docs.length > 0 ? activeTestimonials : FALLBACK

  return (
    <>
      <SEOHead
        title="Testimonials"
        description="Read what parents and students say about Tiptoe Sports Hub — Nepal's #1 football and futsal academy in Kathmandu."
        path="/testimonials"
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Testimonials</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">What Our Community Says</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Real stories from the parents and students who make Tiptoe Sports Hub what it is.</p>
          </motion.div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-10 px-4 bg-gold">
        <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[['370+', 'Happy Students'], ['⭐⭐⭐⭐⭐', '5-Star Reviews'], ['100%', 'Would Recommend']].map(([v, l]) => (
            <div key={l}>
              <div className="font-black text-2xl md:text-3xl text-navy">{v}</div>
              <div className="text-navy/70 text-xs md:text-sm mt-0.5">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-6 h-48 animate-pulse bg-gray-100" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  className="card p-6 flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <FaQuoteLeft className="text-gold/30 text-4xl mb-4" />
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating || 5 }).map((_, j) => <FaStar key={j} className="text-gold text-sm" />)}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 italic mb-5">"{t.text}"</p>
                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    {t.photoURL
                      ? <img src={t.photoURL} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30" />
                      : <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-gold font-bold text-sm shrink-0">{t.name?.[0]}</div>
                    }
                    <div>
                      <div className="font-bold text-navy text-sm">{t.name}</div>
                      <div className="text-gray-400 text-xs">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black text-3xl mb-4">Join Our Growing Family</h2>
          <p className="text-white/65 mb-8">Be the next success story. Enroll your child at Tiptoe Sports Hub today.</p>
          <Link to="/enroll" className="btn-primary">Enroll Now <FaArrowRight /></Link>
        </div>
      </section>
    </>
  )
}
