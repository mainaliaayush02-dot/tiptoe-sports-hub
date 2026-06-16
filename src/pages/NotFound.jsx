import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaHome, FaArrowRight } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import SEOHead from '../components/SEOHead'

export default function NotFound() {
  return (
    <>
      <SEOHead title="404 — Page Not Found" description="The page you're looking for doesn't exist." path="/404" />
      <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center px-4 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />
        <motion.div
          className="relative z-10 text-center max-w-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <GiSoccerBall className="text-8xl text-gold/60" />
          </motion.div>

          <h1 className="font-black text-8xl md:text-9xl text-gold mb-2">404</h1>
          <h2 className="font-black text-2xl mb-4 text-white">Page Not Found</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Looks like this ball went out of bounds! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">
              <FaHome /> Back to Home
            </Link>
            <Link to="/programs" className="btn-outline">
              View Programs <FaArrowRight />
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  )
}
