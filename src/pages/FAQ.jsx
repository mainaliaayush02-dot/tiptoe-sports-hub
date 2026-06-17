import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaPlus, FaMinus, FaArrowRight } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { faqCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'

const CATEGORIES = ['All', 'General', 'Academy', 'Pricing', 'Sports Hub']

const FALLBACK_FAQS = [
  { id: 'q1', category: 'General', order: 1, question: 'Where is Tiptoe Sports Hub located?', answer: 'Tiptoe Sports Hub is located in Tarkeshwar, Kathmandu, Nepal. We are easily accessible from Ring Road and have parking available on site.' },
  { id: 'q2', category: 'General', order: 2, question: 'What sports facilities does Tiptoe Sports Hub offer?', answer: 'We offer Football and Futsal, Cricket, Basketball, Pickleball, Snooker, and a Sports Bar, all under one roof in Tarkeshwar, Kathmandu. Tiptoe Sports Academy (football and futsal coaching) also operates from here.' },
  { id: 'q3', category: 'General', order: 3, question: 'What are your opening hours?', answer: 'Mon–Fri: 6AM–9PM | Saturday: 6AM–8PM | Sunday: 7AM–12PM. Sports Bar: Mon–Thu 4PM–11PM, Fri–Sun 12PM–12AM. Hours may vary on public holidays.' },
  { id: 'q4', category: 'General', order: 4, question: 'Is parking available at Tiptoe Sports Hub?', answer: 'Yes, we have on-site parking for both two-wheelers and four-wheelers. Parking is free for all members and visitors.' },
  { id: 'q5', category: 'Academy', order: 5, question: 'What age groups does Tiptoe Sports Academy accept?', answer: 'Tiptoe Sports Academy accepts students from age 4 to 18. We offer: Football Foundation (Age 4–10), Youth Development (Age 11–15), Elite Performance (Age 16–18), Girls Football (Age 8–18), and Futsal Academy (all ages).' },
  { id: 'q6', category: 'Academy', order: 6, question: 'Do you offer international exposure for students?', answer: 'Yes! Selected students participate in annual Thailand training camps and international tournaments. We have ongoing partnerships with Thai Division clubs for elite-level exposure and trials.' },
  { id: 'q7', category: 'Academy', order: 7, question: 'How many students are currently enrolled?', answer: 'Tiptoe Sports Academy has 370+ active students enrolled across all programs, making us one of the largest private football & futsal academies in Nepal.' },
  { id: 'q8', category: 'Academy', order: 8, question: 'Do you have a girls-only football program?', answer: 'Yes! Our Girls Football Program is open to ages 8–18 and provides a safe, supportive, and empowering environment with experienced female-focused coaching staff.' },
  { id: 'q9', category: 'Academy', order: 9, question: 'How do I enroll my child in the academy?', answer: 'Fill in the enrollment form on our website at /enroll, or contact us directly via phone or WhatsApp. We will schedule a trial session and then confirm enrollment with program details and fee structure.' },
  { id: 'q10', category: 'Pricing', order: 10, question: 'How much does it cost to join the football academy?', answer: 'Football programs start from NPR 2,500/month (Age 4–10), NPR 3,000/month (Age 11–15), and NPR 3,500/month for the Elite program (Age 16–18). Futsal Academy is NPR 2,800/month. Girls Football is NPR 2,500/month.' },
  { id: 'q11', category: 'Pricing', order: 11, question: 'Is there a registration fee to join?', answer: 'Yes, there is a one-time registration and kit fee upon enrollment. Please contact us or check the Pricing page for the latest amounts and any current promotions.' },
  { id: 'q12', category: 'Pricing', order: 12, question: 'Do you offer monthly or annual memberships?', answer: 'We offer monthly memberships for all sports. Basketball, Pickleball, and Snooker monthly memberships include unlimited access. Contact us for corporate group packages and seasonal discounts.' },
  { id: 'q13', category: 'Sports Hub', order: 13, question: 'Can I book a cricket ground for a private match?', answer: 'Yes! The full cricket ground is available for hire at NPR 3,000/session (2 hours). Net practice lanes are NPR 800/hr. Contact us to check availability and make a booking.' },
  { id: 'q14', category: 'Sports Hub', order: 14, question: 'Is Pickleball beginner-friendly?', answer: 'Absolutely! Pickleball is one of the easiest racket sports to learn. We provide paddles and balls, run beginner coaching every Monday and Wednesday evening, and our staff will help you get started on day one.' },
  { id: 'q15', category: 'Sports Hub', order: 15, question: 'Can I host a private event at the Sports Bar?', answer: 'Yes! The Sports Bar is available for private events for up to 50 guests, with exclusive venue hire, full catering, and live sports broadcasting. Contact us for a custom quote and availability.' },
  { id: 'q16', category: 'Sports Hub', order: 16, question: 'Do I need to be a member to use the Sports Bar?', answer: 'No membership is required for the Sports Bar. Walk-ins are welcome with a minimum drink purchase. VIP table bookings are available for groups wanting reserved seating and priority service.' },
]

const CAT_COLORS = {
  General:      'bg-navy/10 text-navy',
  Academy:      'bg-green/10 text-green',
  Pricing:      'bg-gold/20 text-[#c47d00]',
  'Sports Hub': 'bg-purple-100 text-purple-700',
}

function FAQItem({ faq, isOpen, onToggle }) {
  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 ${isOpen ? 'border-navy/20 shadow-md' : 'border-gray-100 shadow-sm'}`}>
      <button
        className="w-full flex items-start justify-between gap-4 p-5 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="flex items-start gap-3 flex-1">
          <span className={`shrink-0 mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[faq.category] || 'bg-gray-100 text-gray-500'}`}>
            {faq.category}
          </span>
          <span className="font-heading font-semibold text-navy text-sm leading-snug">{faq.question}</span>
        </div>
        <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500'}`}>
          {isOpen ? <FaMinus size={11} /> : <FaPlus size={11} />}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [cat, setCat] = useState('All')
  const [openId, setOpenId] = useState(null)
  const q = useMemo(() => query(faqCol, orderBy('order')), [])
  const { docs, loading } = useCollection(q)

  const activeDocs = docs.filter(f => f.active !== false)
  const faqs = activeDocs.length > 0 ? activeDocs : FALLBACK_FAQS
  const filtered = cat === 'All' ? faqs : faqs.filter(f => f.category === cat)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }

  return (
    <>
      <SEOHead
        title="Frequently Asked Questions"
        description="Common questions about Tiptoe Sports Hub and Academy in Kathmandu, covering programs, pricing, enrollment, age groups, facilities, and international exposure."
        path="/faq"
        breadcrumb
        schema={faqSchema}
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">FAQ</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              Everything you need to know about Tiptoe Sports Hub and Tiptoe Sports Academy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 px-4 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCat(c); setOpenId(null) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${cat === c ? 'bg-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-14 px-4 bg-light min-h-[60vh]">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map(faq => (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  isOpen={openId === faq.id}
                  onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">No questions in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 px-4 bg-navy text-white text-center">
        <div className="max-w-xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="text-4xl mb-4">💬</div>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl mb-3">Still have questions?</h2>
            <p className="text-white/60 mb-8 text-base">Our team is happy to help. Reach out via phone, WhatsApp, or the contact form.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact" className="btn-primary py-3.5 px-8">
                Contact Us <FaArrowRight size={12} />
              </Link>
              <Link to="/pricing" className="btn-outline py-3.5 px-8">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore Tiptoe Sports Hub</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/programs', label: 'Training Programs', emoji: '📋' },
              { to: '/pricing', label: 'Membership & Pricing', emoji: '💰' },
              { to: '/coaches', label: 'Our Coaches', emoji: '🧑‍🏫' },
              { to: '/sports/football-futsal', label: 'Football & Futsal', emoji: '⚽' },
              { to: '/sports/cricket', label: 'Cricket', emoji: '🏏' },
              { to: '/sports/basketball', label: 'Basketball', emoji: '🏀' },
              { to: '/enroll', label: 'Enroll Now', emoji: '🎯' },
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
