import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaArrowRight, FaFilter } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { scheduleCol } from '../firebase/collections'
import { useCollection } from '../hooks/useFirestore'
import SEOHead from '../components/SEOHead'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SPORTS = ['All', 'Football', 'Futsal']
const AGE_GROUPS = ['All', 'Age 4–10', 'Age 11–15', 'Age 16–18', 'All Ages']

const FALLBACK_SCHEDULE = [
  { id: 's1', day: 'Monday', startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's2', day: 'Monday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 4–10', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's3', day: 'Monday', startTime: '17:00', endTime: '19:00', sport: 'Futsal', ageGroup: 'All Ages', venue: 'Futsal Arena', coachName: 'Gaurav Basnet' },
  { id: 's4', day: 'Tuesday', startTime: '05:00', endTime: '07:00', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's5', day: 'Tuesday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 11–15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's6', day: 'Wednesday', startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's7', day: 'Wednesday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 4–10', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's8', day: 'Thursday', startTime: '05:00', endTime: '07:00', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's9', day: 'Thursday', startTime: '15:00', endTime: '17:00', sport: 'Futsal', ageGroup: 'All Ages', venue: 'Futsal Arena', coachName: 'Gaurav Basnet' },
  { id: 's10', day: 'Friday', startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's11', day: 'Friday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 11–15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's12', day: 'Saturday', startTime: '06:00', endTime: '08:30', sport: 'Football', ageGroup: 'Age 16–18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's13', day: 'Saturday', startTime: '09:00', endTime: '11:00', sport: 'Football', ageGroup: 'Age 11–15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { id: 's14', day: 'Saturday', startTime: '11:00', endTime: '13:00', sport: 'Football', ageGroup: 'Age 4–10', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
]

const SPORT_COLOR = { Football: 'bg-navy text-white', Futsal: 'bg-green text-white' }

function formatTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

export default function Schedule() {
  const [sport, setSport] = useState('All')
  const [ageGroup, setAgeGroup] = useState('All')
  const schedQ = query(scheduleCol, orderBy('day'))
  const { docs } = useCollection(schedQ)

  const schedule = docs.length > 0 ? docs : FALLBACK_SCHEDULE

  const filtered = schedule.filter(s =>
    (sport === 'All' || s.sport === sport) &&
    (ageGroup === 'All' || s.ageGroup === ageGroup)
  )

  const byDay = DAYS.reduce((acc, d) => {
    acc[d] = filtered.filter(s => s.day === d)
    return acc
  }, {})

  return (
    <>
      <SEOHead
        title="Football & Futsal Training Schedule in Kathmandu"
        description="Weekly football and futsal training schedule at Tiptoe Sports Academy, Tarkeshwar Kathmandu. Morning and evening sessions for ages 4–18, Monday through Saturday."
        path="/schedule"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Training Schedule</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Training Schedule</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Football and futsal sessions Monday through Saturday. Find the right time for your child in Tarkeshwar, Kathmandu.</p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 px-4 bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400 text-sm" />
            <span className="text-sm font-semibold text-gray-600">Sport:</span>
            <div className="flex gap-2">
              {SPORTS.map(s => (
                <button key={s} onClick={() => setSport(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${sport === s ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">Age Group:</span>
            <div className="flex gap-2 flex-wrap">
              {AGE_GROUPS.map(ag => (
                <button key={ag} onClick={() => setAgeGroup(ag)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${ageGroup === ag ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{ag}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Grid */}
      <section className="py-12 px-4 bg-light min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS.map(day => (
              <motion.div key={day} className="bg-white rounded-2xl overflow-hidden shadow-sm" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <div className="bg-navy text-white px-4 py-3">
                  <h3 className="font-bold">{day}</h3>
                </div>
                <div className="p-3">
                  {byDay[day].length > 0 ? (
                    <div className="space-y-2">
                      {byDay[day].map(slot => (
                        <div key={slot.id} className="p-3 rounded-xl border border-gray-100 hover:border-navy/20 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SPORT_COLOR[slot.sport] || 'bg-gray-100 text-gray-600'}`}>{slot.sport}</span>
                            <span className="text-xs text-gold font-semibold">{formatTime(slot.startTime)} – {formatTime(slot.endTime)}</span>
                          </div>
                          <div className="text-xs text-navy font-semibold">{slot.ageGroup}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{slot.venue}</div>
                          {slot.coachName && <div className="text-xs text-gray-400">Coach: {slot.coachName}</div>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-300 text-sm py-6">No sessions</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-500 mb-4">Ready to start your training journey?</p>
            <Link to="/enroll" className="btn-primary">Enroll Now <FaArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Explore More</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/programs',  label: 'Training Programs',        emoji: '📋' },
              { to: '/pricing',   label: 'Membership & Pricing',     emoji: '💰' },
              { to: '/coaches',   label: 'Meet Our Coaches',         emoji: '🧑‍🏫' },
              { to: '/sports/football-futsal', label: 'Football & Futsal', emoji: '⚽' },
              { to: '/enroll',    label: 'Enroll Now',               emoji: '🎯' },
            ].map(({ to, label, emoji }) => (
              <Link key={to} to={to}
                className="flex items-center gap-2 bg-light hover:bg-navy hover:text-white border border-gray-200 hover:border-navy text-gray-700 rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 shadow-sm">
                <span>{emoji}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
