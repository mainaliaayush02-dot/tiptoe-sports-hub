import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from '../WhatsAppButton'
import ScrollToTop from '../ScrollToTop'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <motion.main
        key={location.pathname}
        className="flex-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
      >
        <Outlet />
      </motion.main>
      <Footer />
      <WhatsAppButton />
      <Analytics />
      <SpeedInsights />
    </div>
  )
}
