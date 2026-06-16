import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { query, orderBy, where } from 'firebase/firestore'
import { eventsCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import LoadingSkeleton from '../components/LoadingSkeleton'

const upcomingQ = query(eventsCol, where('isUpcoming', '==', true), orderBy('date'))
const pastQ = query(eventsCol, where('isUpcoming', '==', false), orderBy('date', 'desc'))

export default function Events() {
  const [tab, setTab] = useState('upcoming')
  const { docs: upcoming, loading: uLoading } = useCollection(upcomingQ)
  const { docs: past, loading: pLoading } = useCollection(pastQ)

  const events = tab === 'upcoming' ? upcoming : past
  const loading = tab === 'upcoming' ? uLoading : pLoading

  return (
    <>
      <SEOHead
        title="Events"
        description="Stay updated with Tiptoe Sports Hub events — tournaments, training camps, international programs, and more."
        path="/events"
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Events</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Academy Events</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Tournaments, international exposure camps, and special programs.</p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-8 px-4 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex gap-3">
          {['upcoming', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm capitalize transition-all ${
                tab === t ? 'bg-navy text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'upcoming' ? 'Upcoming Events' : 'Past Events'}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <LoadingSkeleton count={6} />
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((ev, i) => (
                <motion.div key={ev.id} className="card overflow-hidden flex flex-col" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  {ev.bannerURL
                    ? <img src={ev.bannerURL} alt={ev.title} className="w-full h-48 object-cover" />
                    : (
                      <div className="w-full h-48 bg-gradient-to-br from-navy to-green flex items-center justify-center">
                        <GiSoccerBall className="text-7xl text-white/20" />
                      </div>
                    )
                  }
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                      <span className="flex items-center gap-1 text-gold font-semibold"><FaCalendarAlt /> {ev.date}</span>
                      {ev.venue && <span className="flex items-center gap-1"><FaMapMarkerAlt /> {ev.venue}</span>}
                    </div>
                    <h3 className="font-bold text-navy text-xl mb-2">{ev.title}</h3>
                    {ev.description && <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-4">{ev.description}</p>}
                    <div className="flex items-center justify-between mt-auto">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${ev.isUpcoming ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-500'}`}>
                        {ev.isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                      {ev.registrationLink && ev.isUpcoming && (
                        <a href={ev.registrationLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-navy font-semibold text-sm hover:text-gold transition-colors">
                          Register <FaExternalLinkAlt size={11} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <FaCalendarAlt className="text-6xl text-gray-200 mx-auto mb-4" />
              <h3 className="font-bold text-gray-400 text-xl mb-2">
                {tab === 'upcoming' ? 'No upcoming events at the moment' : 'No past events found'}
              </h3>
              <p className="text-gray-400">Check back soon for new events and programs.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-navy text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black text-3xl mb-4">Want to Participate?</h2>
          <p className="text-white/65 mb-8">Enroll in our programs to be eligible for tournaments, camps, and international events.</p>
          <Link to="/enroll" className="btn-primary">Enroll Now <FaArrowRight /></Link>
        </div>
      </section>
    </>
  )
}
