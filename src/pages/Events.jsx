import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaCalendarAlt, FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { query, orderBy, where } from 'firebase/firestore'
import { eventsCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'
import ContentLoader from '../components/ContentLoader'

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
        title="Sports Events & Tournaments at Tiptoe Sports Hub"
        description="Upcoming and past events at Tiptoe Sports Hub, Kathmandu. Football tournaments, Thailand training camps, youth competitions and community sports programs."
        path="/events"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Events</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Events and Tournaments</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Football tournaments, Thailand training camps, and special programs from Tiptoe Sports Academy in Kathmandu.</p>
          </motion.div>
        </div>
      </section>

      {/* Static intro — always visible to crawlers */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-navy mb-4">Events at Tiptoe Sports Hub</h2>
          <p className="text-gray-500 text-base leading-relaxed mb-4">
            Tiptoe Sports Hub in Tarakeshwar, Kathmandu hosts a regular calendar of sports events, tournaments, competitions and community programmes throughout the year. From inter-school football tournaments to snooker club nights, basketball open days and special match-screening evenings at our Sports Lounge, there is always something happening at the hub.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-4">
            Our flagship annual event is the Thailand Training Camp — an international exposure programme where selected students from Tiptoe Sports Academy travel to Bangkok to train with Silie Sports Club. This programme gives young Nepali players the rare opportunity to train alongside Thai Division academy athletes, experience world-class facilities, and represent Nepal in cross-border friendly matches.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            Other regular events include the Tiptoe Cup (our annual inter-academy football tournament), seasonal cricket tournaments on our professional ground, monthly pickleball club competitions, and special match-day events at our Sports Lounge for major international fixtures. To register for an upcoming event or to host a private sports event at our Tarakeshwar facility, contact us on +977-984-1416893 or +977-970-7079773.
          </p>
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
          <ContentLoader loading={loading} count={6}>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev, i) => (
                  <motion.div key={ev.id} className="card overflow-hidden flex flex-col" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
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
          </ContentLoader>
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
