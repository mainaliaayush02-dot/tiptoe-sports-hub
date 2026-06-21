import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaCalendarAlt, FaTag, FaUser } from 'react-icons/fa'
import { FaInstagram, FaFacebook } from 'react-icons/fa'
import { query, where, getDocs, limit } from 'firebase/firestore'
import { blogCol } from '../firebase/collections'
import SEOHead, { BASE_URL } from '../components/SEOHead'
import { GiSoccerBall } from 'react-icons/gi'
import DOMPurify from 'dompurify'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const q = query(blogCol, where('slug', '==', slug), where('status', '==', 'published'), limit(1))
        const snap = await getDocs(q)
        if (!snap.empty) setPost({ id: snap.docs[0].id, ...snap.docs[0].data() })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-28 flex flex-col items-center justify-center text-center px-4">
        <GiSoccerBall className="text-7xl text-gray-200 mb-4" />
        <h2 className="font-black text-2xl text-gray-400 mb-4">Post not found</h2>
        <Link to="/blog" className="btn-primary">Back to Blog <FaArrowLeft /></Link>
      </div>
    )
  }

  const shareUrl = `${BASE_URL}/blog/${post.slug}`

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.excerpt || `Read "${post.title}" on the Tiptoe Sports Hub blog.`}
        path={`/blog/${post.slug}`}
        image={post.imageURL}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || '',
          image: post.imageURL || `${BASE_URL}/logo.jpeg`,
          url: `${BASE_URL}/blog/${post.slug}`,
          datePublished: post.publishedAt?.toDate ? post.publishedAt.toDate().toISOString() : new Date(post.publishedAt || Date.now()).toISOString(),
          author: {
            '@type': 'Organization',
            name: post.author || 'Tiptoe Sports Hub',
            url: BASE_URL,
          },
          publisher: {
            '@type': 'Organization',
            name: 'Tiptoe Sports Hub',
            url: BASE_URL,
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.jpeg` },
          },
        }}
      />

      {/* Hero */}
      <section className="pt-24 bg-dark text-white">
        {post.imageURL ? (
          <div className="relative h-64 md:h-96">
            <img src={post.imageURL} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-4xl mx-auto">
              {post.category && (
                <span className="bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">{post.category}</span>
              )}
              <h1 className="font-black text-3xl md:text-4xl leading-tight">{post.title}</h1>
            </div>
          </div>
        ) : (
          <div className="relative px-4 py-20 text-center max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#06145F_0%,_#030A2E_70%)]" />
            <div className="relative z-10">
              {post.category && (
                <span className="badge-gold mb-4 inline-flex">
                  {post.category}
                </span>
              )}
              <h1 className="font-black text-3xl md:text-5xl leading-tight mt-4">{post.title}</h1>
            </div>
          </div>
        )}
      </section>

      {/* Meta */}
      <div className="bg-white border-b border-gray-100 py-4 px-4 sticky top-16 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {post.author && <span className="flex items-center gap-1.5"><FaUser className="text-navy" /> {post.author}</span>}
            {post.publishedAt && <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-navy" /> {formatDate(post.publishedAt)}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 mr-1">Share:</span>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700"><FaFacebook size={18} /></a>
          </div>
        </div>
      </div>

      {/* Content */}
      <article className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {post.excerpt && (
              <p className="text-gray-500 text-lg leading-relaxed border-l-4 border-gold pl-5 mb-8 italic">{post.excerpt}</p>
            )}
            <div
              className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-navy prose-a:text-navy prose-strong:text-navy"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
          </motion.div>

          {/* Back */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            <Link to="/blog" className="flex items-center gap-2 text-navy font-semibold hover:text-gold transition-colors">
              <FaArrowLeft /> Back to Blog
            </Link>
            <Link to="/enroll" className="btn-primary text-sm py-2.5">Enroll Now</Link>
          </div>
        </div>
      </article>
    </>
  )
}
