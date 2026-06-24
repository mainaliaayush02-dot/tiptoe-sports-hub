import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaTimes, FaChevronLeft, FaChevronRight, FaImages } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { galleryCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import ContentLoader from '../components/ContentLoader'

const CATEGORIES = ['All', 'Training', 'Events', 'Tournaments', 'International']
const allQ = query(galleryCol, orderBy('createdAt', 'desc'))

const FALLBACK_IMAGES = [
  { id: 'f1', url: '/1.png',  category: 'Training',      caption: 'Tiptoe Academy vs SWSC FA at Tarkeshwar, Kathmandu', alt: 'Tiptoe Sports Academy football team group photo with coaches at training ground in Tarkeshwar Kathmandu Nepal' },
  { id: 'f2', url: '/2.jpg',  category: 'Training',      caption: 'Tiptoe Academy player in match training session',    alt: 'Young footballer in Tiptoe Academy yellow jersey training at Kathmandu football academy Nepal' },
]

export default function Gallery() {
  const [cat, setCat] = useState('All')
  const [lightbox, setLightbox] = useState(null)
  const { docs, loading } = useCollection(allQ)

  const images = docs.length > 0 ? docs : FALLBACK_IMAGES
  const filtered = cat === 'All' ? images : images.filter(img => img.category === cat)

  const openLightbox = idx => setLightbox(idx)
  const closeLightbox = () => setLightbox(null)
  const prev = () => setLightbox(i => (i - 1 + filtered.length) % filtered.length)
  const next = () => setLightbox(i => (i + 1) % filtered.length)

  const handleKeyDown = e => {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') closeLightbox()
  }

  return (
    <>
      <SEOHead
        title="Photo Gallery at Tiptoe Sports Hub, Kathmandu"
        description="Photos from Tiptoe Sports Hub in Tarakeshwar, Kathmandu. Football training, cricket, basketball, tournaments, Thailand camps and memorable moments from the hub."
        path="/gallery"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Gallery</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Tiptoe Sports Hub Gallery</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Training sessions, tournaments, Thailand camps and more. Moments from Nepal's #1 football academy in Kathmandu.</p>
          </motion.div>
        </div>
      </section>

      {/* Static intro — always visible to crawlers */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl text-navy mb-4">Life at Tiptoe Sports Hub</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Explore life at Tiptoe Sports Hub in Tarakeshwar, Kathmandu — Nepal's premier multi-sport destination. Our gallery captures training sessions across six sports: Football, Cricket, Basketball, Pickleball, Snooker and our Sports Lounge. From early-morning fitness sessions to tournament finals, every image tells the story of a community built around sport.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Tiptoe Sports Academy's international exposure programme brings some of our most memorable moments. Students who travel to Thailand for training camps with Silie Sports Club return with new skills, new friends, and a new perspective on what football can mean. These Thailand camp photos are some of the most viewed in our gallery.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            Browse by category below — Training, Events, Tournaments or International — to find specific moments. All photos are shot on-site at our Tarakeshwar facility, 44600 Kathmandu. If you would like to visit, we are open seven days a week. Call us on +977-984-1416893 or +977-970-7079773 to book a court, schedule a trial, or simply come and watch a session.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-4 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                cat === c ? 'bg-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          <ContentLoader loading={loading} count={9}>
            {filtered.length > 0 ? (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
                {filtered.map((img, i) => (
                  <motion.div
                    key={img.id}
                    className="break-inside-avoid cursor-pointer overflow-hidden rounded-xl"
                    initial={{ opacity: 0, scale: 0.97 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i % 4) * 0.05 }}
                    onClick={() => openLightbox(i)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="relative group">
                      <img
                        src={img.url}
                        alt={img.alt || img.caption || `Tiptoe Sports Academy ${img.category} Kathmandu Nepal`}
                        className="w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                        {img.caption && <p className="text-white text-xs font-semibold">{img.caption}</p>}
                      </div>
                      {img.category && (
                        <span className="absolute top-2 left-2 text-xs bg-gold text-navy font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.category}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <FaImages className="text-6xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No photos in this category yet.</p>
              </div>
            )}
          </ContentLoader>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore Tiptoe Sports Hub</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/programs',  label: 'Training Programs',      emoji: '📋' },
              { to: '/coaches',   label: 'Meet Our Coaches',       emoji: '🧑‍🏫' },
              { to: '/events',    label: 'Events & Tournaments',   emoji: '🏆' },
              { to: '/testimonials', label: 'Student Reviews',     emoji: '⭐' },
              { to: '/enroll',    label: 'Enroll Now',             emoji: '🎯' },
            ].map(({ to, label, emoji }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 bg-light hover:bg-navy hover:text-white border border-gray-200 hover:border-navy text-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 shadow-sm">
                <span>{emoji}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <button
              onClick={e => { e.stopPropagation(); closeLightbox() }}
              className="absolute top-4 right-4 text-white/60 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
            >
              <FaTimes size={20} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); prev() }}
              className="absolute left-4 text-white/60 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
            >
              <FaChevronLeft size={20} />
            </button>
            <motion.div
              key={lightbox}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl max-h-[90vh] mx-16"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={filtered[lightbox]?.url}
                alt={filtered[lightbox]?.alt || filtered[lightbox]?.caption || 'Tiptoe Sports Academy Kathmandu Nepal'}
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />
              {filtered[lightbox]?.caption && (
                <p className="text-white/70 text-center mt-3 text-sm">{filtered[lightbox].caption}</p>
              )}
              <p className="text-white/40 text-center text-xs mt-1">{lightbox + 1} / {filtered.length}</p>
            </motion.div>
            <button
              onClick={e => { e.stopPropagation(); next() }}
              className="absolute right-4 text-white/60 hover:text-white p-3 rounded-full bg-white/10 transition-colors"
            >
              <FaChevronRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
