import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarAlt, FaTag } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { query, orderBy } from 'firebase/firestore'
import { blogCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import ContentLoader from '../components/ContentLoader'

const publishedQ = query(blogCol, orderBy('publishedAt', 'desc'))

const FALLBACK_BLOG = [
  {
    id: 'b1', status: 'published', category: 'International',
    title: 'Tiptoe Sports Academy Students Complete Thailand Training Camp with Silie Sports Club',
    excerpt: 'Selected students from Tiptoe Sports Academy traveled to Bangkok for an intensive football training camp with Silie Sports Club, gaining international match experience against Thai Division sides.',
    author: 'Tiptoe Sports Hub', slug: '#', publishedAt: new Date('2025-03-01'),
  },
  {
    id: 'b2', status: 'published', category: 'Coaching',
    title: "Nepal's #1 Football Academy: How Tiptoe Sports Hub Develops Champions from Age 4",
    excerpt: "Tiptoe Sports Academy's structured age-group programs guide young athletes from their first kick at age 4 all the way to elite-level competition at 18, with professional national-level coaching at every stage.",
    author: 'Tiptoe Sports Hub', slug: '#', publishedAt: new Date('2025-01-15'),
  },
  {
    id: 'b3', status: 'published', category: 'Coaching',
    title: 'Meet Gaurav Basnet: The Coach Who Led Nepal to Three Futsal Championships',
    excerpt: "Nepal National Futsal Team Head Coach for three consecutive terms, Gaurav Basnet brings world-class expertise to every session at Tiptoe Sports Academy in Tarkeshwar, Kathmandu.",
    author: 'Tiptoe Sports Hub', slug: '#', publishedAt: new Date('2024-11-20'),
  },
]

const CATEGORY_COLORS = {
  News: 'bg-blue-100 text-blue-700',
  Training: 'bg-green/10 text-green',
  Events: 'bg-gold/10 text-[#c47d00]',
  International: 'bg-purple-100 text-purple-700',
  Coaching: 'bg-navy/10 text-navy',
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Blog() {
  const { docs, loading } = useCollection(publishedQ)
  const posts = docs.length > 0 ? docs.filter(p => p.status === 'published') : FALLBACK_BLOG

  return (
    <>
      <SEOHead
        title="News & Stories from Tiptoe Sports Hub"
        description="Latest news, training tips, and stories from Tiptoe Sports Hub, Nepal's #1 football and futsal academy in Tarkeshwar, Kathmandu."
        path="/blog"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Blog</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">News & Stories from the Academy</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Football training tips, player stories, tournament updates, and more from Tiptoe Sports Hub, Kathmandu.</p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className="py-16 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          <ContentLoader loading={loading} count={6}>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post, i) => (
                  <motion.article key={post.id} className="card overflow-hidden flex flex-col" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                    {post.imageURL
                      ? <img src={post.imageURL} alt={post.title} className="w-full h-48 object-cover" />
                      : <div className="w-full h-48 bg-gradient-to-br from-navy to-green flex items-center justify-center"><GiSoccerBall className="text-7xl text-white/20" /></div>
                    }
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {post.category && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${CATEGORY_COLORS[post.category] || 'bg-gray-100 text-gray-600'}`}>
                            <FaTag size={9} /> {post.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                          <FaCalendarAlt /> {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <h2 className="font-bold text-navy text-xl mb-2 line-clamp-2">{post.title}</h2>
                      {post.excerpt && <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">{post.excerpt}</p>}
                      {post.author && <p className="text-xs text-gray-400 mb-3">By {post.author}</p>}
                      <Link to={`/blog/${post.slug}`} className="text-navy font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all mt-auto">
                        Read More <FaArrowRight size={12} />
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <GiSoccerBall className="text-6xl text-gray-200 mx-auto mb-4" />
                <h3 className="font-bold text-gray-400 text-xl mb-2">No posts yet</h3>
                <p className="text-gray-400">Check back soon for news and stories from the academy.</p>
              </div>
            )}
          </ContentLoader>
        </div>
      </section>
    </>
  )
}
