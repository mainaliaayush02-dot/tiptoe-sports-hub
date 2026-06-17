import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MdPeople, MdSportsScore, MdEventNote, MdPhotoLibrary, MdInbox, MdArrowForward, MdRocketLaunch, MdCheckCircle } from 'react-icons/md'
import { query, orderBy, limit, addDoc, getDocs } from 'firebase/firestore'
import { programsCol, eventsCol, galleryCol, inquiriesCol, coachesCol, scheduleCol, sportsCol, pricingCol, faqCol } from '../../firebase/collections'
import { useCollection } from '../../hooks/useFirestore'
import toast from 'react-hot-toast'

/* ── Seed data (matches all hardcoded website content) ─────────────────── */
const SEED_PROGRAMS = [
  { name: 'Football Foundation', sport: 'Football', ageGroup: 'Age 4-10', description: 'Foundation skills, coordination, and a love for the beautiful game. Perfect starting point for young players.', schedule: 'Mon, Wed, Fri  3:00 PM - 5:00 PM', fee: 'NPR 2,500/month', emoji: '⚽', active: true, order: 1 },
  { name: 'Youth Development',   sport: 'Football', ageGroup: 'Age 11-15', description: 'Intermediate tactical training focusing on positioning, team play, and individual skill development.', schedule: 'Mon, Wed, Fri  4:00 PM - 6:00 PM', fee: 'NPR 3,000/month', emoji: '⚽', active: true, order: 2 },
  { name: 'Elite Performance',   sport: 'Football', ageGroup: 'Age 16-18', description: 'Elite performance program with professional-level training methodologies and match analysis.', schedule: 'Tue, Thu, Sat  6:00 AM - 8:00 AM', fee: 'NPR 3,500/month', emoji: '🏆', active: true, order: 3 },
  { name: 'Futsal Academy',      sport: 'Futsal',   ageGroup: 'All Ages',  description: 'Indoor futsal techniques, fast-paced play skills, and futsal-specific tactics for all ages.', schedule: 'Tue, Thu, Sat  4:00 PM - 6:00 PM', fee: 'NPR 2,800/month', emoji: '🥅', active: true, order: 4 },
  { name: 'Girls Football',      sport: 'Football', ageGroup: 'Age 8-18',  description: 'A dedicated program empowering girls through football. Supportive environment with female-focused coaching.', schedule: 'Mon, Wed, Fri  3:00 PM - 5:00 PM', fee: 'NPR 2,500/month', emoji: '⭐', active: true, order: 5 },
  { name: 'Holiday Camps',       sport: 'Special',  ageGroup: 'All Ages',  description: 'Intensive short-term programs during school holidays. Focus on accelerated skill development and fun.', schedule: 'Daily during school holidays  8:00 AM - 12:00 PM', fee: 'NPR 5,000/week', emoji: '🌟', active: true, order: 6 },
  { name: 'International Exposure', sport: 'Special', ageGroup: 'Selected', description: 'Thailand training camps, Asian championship participation, and trials with Thai Division clubs for selected students.', schedule: 'Annual - Thailand (Bangkok)', fee: 'Contact for details', emoji: '🌏', active: true, order: 7 },
]

const SEED_COACHES = [
  {
    name: 'Gaurav Basnet', role: 'President & Head Coach', experience: '27+ Years',
    bio: "With over 27 years in football, Gaurav Basnet is one of Nepal's most respected football minds. As a former coach of Manang Marshyangdi Club in Nepal's A Division and the Nepal National Futsal Team for three consecutive terms, he has brought international-level expertise to every player he has trained.",
    achievements: ['Nepal National Futsal Team Head Coach - 3 consecutive terms', 'Former Head Coach, Manang Marshyangdi Club (A Division)', 'Led Nepal internationally: Iran, Kyrgyzstan, Mongolia', 'Co-founded Tiptoe Sports Hub in 2021', 'Pioneer of structured youth football development in Nepal'],
    photoURL: '', active: true, featured: true, order: 1,
  },
  {
    name: 'Hari Khadka', role: 'Brand Ambassador & Technical Advisor', experience: '20+ Years',
    bio: "A living legend of Nepali football, Hari Khadka is Nepal's all-time highest international goal scorer and the former captain of the National Men's Football Team. His passion for developing the next generation of Nepali talent makes him an invaluable part of the Tiptoe Sports Hub family.",
    achievements: ["Nepal's All-Time Highest International Goal Scorer", 'Former Captain, Nepal National Football Team', "Former Head Coach, National Women's Football Team", 'Former Acting Technical Director, ANFA', 'Inspiration to an entire generation of Nepali footballers'],
    photoURL: '', active: true, featured: true, order: 2,
  },
]

const SEED_SCHEDULE = [
  { day: 'Monday',    startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Monday',    startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 4-10',  venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Monday',    startTime: '17:00', endTime: '19:00', sport: 'Futsal',   ageGroup: 'All Ages',  venue: 'Futsal Arena',      coachName: 'Gaurav Basnet' },
  { day: 'Tuesday',   startTime: '05:00', endTime: '07:00', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Tuesday',   startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 11-15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Wednesday', startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Wednesday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 4-10',  venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Thursday',  startTime: '05:00', endTime: '07:00', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Thursday',  startTime: '15:00', endTime: '17:00', sport: 'Futsal',   ageGroup: 'All Ages',  venue: 'Futsal Arena',      coachName: 'Gaurav Basnet' },
  { day: 'Friday',    startTime: '05:00', endTime: '06:30', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Friday',    startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'Age 11-15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Saturday',  startTime: '06:00', endTime: '08:30', sport: 'Football', ageGroup: 'Age 16-18', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Saturday',  startTime: '09:00', endTime: '11:00', sport: 'Football', ageGroup: 'Age 11-15', venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
  { day: 'Saturday',  startTime: '11:00', endTime: '13:00', sport: 'Football', ageGroup: 'Age 4-10',  venue: 'Tarkeshwar Ground', coachName: 'Gaurav Basnet' },
]

const SEED_SPORTS = [
  { name: 'Football & Futsal', slug: 'football-futsal', emoji: '⚽', tagline: "Nepal's Premier Football & Futsal Academy", description: "Tiptoe Sports Hub is Nepal's #1 private football and futsal academy, delivering world-class coaching to 370+ students daily in Tarkeshwar, Kathmandu. Structured programs for ages 4-18 with international exposure to Thailand.", facilities: "Full-size outdoor football field\nIndoor futsal court\nChanging rooms & showers\nEquipment room & kit storage\nCoaching video analysis setup", pricing: "Football Foundation (Age 4-10) - NPR 2,500/month\nYouth Development (Age 11-15) - NPR 3,000/month\nElite Performance (Age 16-18) - NPR 3,500/month\nFutsal Academy (All Ages) - NPR 2,800/month\nGirls Football (Age 8-18) - NPR 2,500/month", schedule: 'Mon-Fri: 6AM-8AM & 3PM-7PM | Sat-Sun: 7AM-12PM', seoTitle: 'Football & Futsal Academy in Kathmandu | Tiptoe Sports Hub', seoDescription: "Nepal's #1 football and futsal academy in Tarkeshwar, Kathmandu. Programs for ages 4-18, professional coaches, and international exposure to Thailand.", color: '#06145F', active: true, order: 1 },
  { name: 'Basketball', slug: 'basketball', emoji: '🏀', tagline: 'Premium Courts & Professional Coaching', description: 'Experience premium basketball training and open play at Tiptoe Sports Hub. Professional-grade courts and coaching staff provide the perfect environment for players of all skill levels.', facilities: "Full-size basketball court\nScoreboard & timing system\nSpectator seating\nLocker rooms with showers\nBall & equipment rental", pricing: "Court Hire - NPR 1,500/hr\nMonthly Membership - NPR 4,000/month\nCoaching Program - NPR 3,500/month\nTeam Package - NPR 6,000/month", schedule: 'Daily: 6AM-10PM | Coached sessions: Tue, Thu, Sat 5PM-7PM', seoTitle: 'Basketball Courts & Training in Kathmandu | Tiptoe Sports Hub', seoDescription: 'Premium basketball courts and professional training in Tarkeshwar, Kathmandu. Open play, memberships, and coached sessions for all ages.', color: '#B85A00', active: true, order: 2 },
  { name: 'Pickleball', slug: 'pickleball', emoji: '🎾', tagline: "Nepal's Premier Pickleball Facility", description: "Discover the fastest-growing racket sport at Tiptoe Sports Hub. Pickleball combines tennis, badminton, and ping-pong into an exciting fast-paced game. We offer dedicated courts, professional equipment, and coaching for beginners.", facilities: "Dedicated pickleball courts\nProfessional court lighting\nEquipment rental & retail\nRefreshments corner\nSpectator seating", pricing: "Court Hire - NPR 1,200/hr (includes paddles & balls)\nMonthly Access - NPR 3,500/month\nCoaching Package - NPR 4,000/month (8 sessions)\nTournament Entry - NPR 500/event", schedule: 'Daily: 6AM-10PM | Beginner sessions: Mon, Wed 6PM-8PM', seoTitle: 'Pickleball Courts in Kathmandu | Tiptoe Sports Hub', seoDescription: "Nepal's premier pickleball facility in Tarkeshwar, Kathmandu. Beginner-friendly courts, equipment included, coaching available.", color: '#1B7F5E', active: true, order: 3 },
  { name: 'Snooker', slug: 'snooker', emoji: '🎱', tagline: 'Premium Snooker Club & Professional Tables', description: "Tiptoe Sports Hub's snooker club offers the finest billiards experience in Kathmandu. Professional-grade tables, optimal lighting, and a relaxed premium atmosphere for casual play, practice, or competitive matches.", facilities: "Multiple professional snooker tables\nDedicated tournament-grade lighting\nComfortable lounge area\nCue & equipment rack\nRefreshment service", pricing: "Table Hire - NPR 800/hr (equipment included)\nMonthly Membership - NPR 3,000/month\nVIP Membership - NPR 5,000/month (priority booking + lounge)\nDay Pass - NPR 400/day", schedule: 'Daily: 10AM-11PM | Open 7 days a week', seoTitle: 'Snooker Club in Kathmandu | Tiptoe Sports Hub', seoDescription: 'Premium snooker club with professional tables in Tarkeshwar, Kathmandu. Table hire, memberships, and VIP packages available.', color: '#2D7D46', active: true, order: 4 },
  { name: 'Sports Bar', slug: 'sports-bar', emoji: '🍹', tagline: 'Live Sports, Premium Drinks & Great Vibes', description: "The ultimate sports viewing experience at Tiptoe Sports Hub. Multiple large HD screens, live sports broadcasts, premium drinks, great food, and a vibrant community atmosphere. Watch Champions League, World Cup, or Nepal Super League.", facilities: "Multiple large HD projection screens\nFull bar service\nIndoor lounge seating\nOutdoor terrace area\nPrivate event space (up to 50 guests)\nLive sports satellite subscription", pricing: "Walk-In - Free entry with drink purchase\nVIP Table (4 pax) - NPR 2,000 minimum spend\nMatch Day Package - NPR 5,000 for 10 pax (food + drinks + seating)\nPrivate Event - Contact for quote", schedule: 'Mon-Thu: 4PM-11PM | Fri-Sun: 12PM-12AM | Special event hours vary', seoTitle: 'Sports Bar in Kathmandu | Tiptoe Sports Hub', seoDescription: "Kathmandu's premier sports bar in Tarkeshwar. Live sports on big screens, premium drinks, great food.", color: '#8B4A00', active: true, order: 5 },
]

const SEED_PRICING = [
  { sport: 'Football', title: 'Football Foundation', price: 'NPR 2,500', period: '/month', badge: '',        features: ['3 sessions/week', 'Age 4–10', 'Foundation skills & fun', 'Certified coaching', 'Kit provided'],                        active: true, order: 1 },
  { sport: 'Football', title: 'Youth Development',   price: 'NPR 3,000', period: '/month', badge: 'Popular', features: ['3 sessions/week', 'Age 11–15', 'Tactical & competitive prep', 'Match analysis', 'Certified coaching'],                 active: true, order: 2 },
  { sport: 'Football', title: 'Elite Performance',   price: 'NPR 3,500', period: '/month', badge: '',        features: ['5 sessions/week', 'Age 16–18', 'High-intensity professional track', 'International exposure', 'Video analysis'],       active: true, order: 3 },
  { sport: 'Football', title: 'Futsal Academy',       price: 'NPR 2,800', period: '/month', badge: '',        features: ['3 sessions/week', 'All ages', 'Indoor futsal specific', 'Certified coaching'],                                          active: true, order: 4 },
  { sport: 'Football', title: 'Girls Football',       price: 'NPR 2,500', period: '/month', badge: '',        features: ['3 sessions/week', 'Age 8–18', 'Female-focused coaching', 'Safe supportive environment'],                               active: true, order: 5 },
  { sport: 'Cricket',  title: 'Ground Hire',          price: 'NPR 3,000', period: '/session', badge: '',      features: ['Full ground (2 hrs)', 'Professional pitch', 'Changing rooms included', 'Equipment available'],                          active: true, order: 6 },
  { sport: 'Cricket',  title: 'Net Practice',         price: 'NPR 800',   period: '/hr',      badge: '',      features: ['Batting nets (4 lanes)', 'Equipment available', 'Bowling machine access'],                                             active: true, order: 7 },
  { sport: 'Cricket',  title: 'Coaching Program',     price: 'NPR 4,000', period: '/month',   badge: 'Popular', features: ['All ages', 'Skill tracking', 'Professional coaches', 'Video analysis'],                                             active: true, order: 8 },
  { sport: 'Basketball', title: 'Court Hire',         price: 'NPR 1,500', period: '/hr',      badge: '',      features: ['Full court access', 'Walk-ins welcome', 'Ball included'],                                                             active: true, order: 9 },
  { sport: 'Basketball', title: 'Monthly Membership', price: 'NPR 4,000', period: '/month',   badge: 'Popular', features: ['Unlimited court access', 'All ages', 'Locker room access'],                                                         active: true, order: 10 },
  { sport: 'Pickleball', title: 'Court Hire',         price: 'NPR 1,200', period: '/hr',      badge: '',      features: ['Paddles & balls included', 'Walk-ins welcome', 'Professional courts'],                                               active: true, order: 11 },
  { sport: 'Pickleball', title: 'Monthly Access',     price: 'NPR 3,500', period: '/month',   badge: 'Popular', features: ['Unlimited court access', 'All ages', 'Equipment included'],                                                        active: true, order: 12 },
  { sport: 'Snooker',  title: 'Table Hire',           price: 'NPR 800',   period: '/hr',      badge: '',      features: ['Professional tables', 'Cues & chalk included', 'Walk-ins welcome'],                                                  active: true, order: 13 },
  { sport: 'Snooker',  title: 'Monthly Member',       price: 'NPR 3,000', period: '/month',   badge: 'Popular', features: ['Unlimited play', 'Priority booking', 'Club atmosphere'],                                                           active: true, order: 14 },
  { sport: 'Snooker',  title: 'VIP Membership',       price: 'NPR 5,000', period: '/month',   badge: 'Best Value', features: ['Priority booking', 'Lounge access', 'Exclusive events'],                                                       active: true, order: 15 },
  { sport: 'Sports Bar', title: 'Walk-In',            price: 'Free entry', period: '',         badge: '',      features: ['With minimum drink purchase', 'Live sports on big screens', 'Full drinks & food menu'],                              active: true, order: 16 },
  { sport: 'Sports Bar', title: 'VIP Table',          price: 'NPR 2,000', period: 'min spend', badge: 'Popular', features: ['Reserved seating for 4', 'Priority service', 'All major sports events'],                                          active: true, order: 17 },
]

const SEED_FAQ = [
  { category: 'General',    order: 1,  active: true, question: 'Where is Tiptoe Sports Hub located?',                            answer: 'Tiptoe Sports Hub is located in Tarkeshwar, Kathmandu, Nepal. We are easily accessible from Ring Road and have parking available on site.' },
  { category: 'General',    order: 2,  active: true, question: 'What sports facilities does Tiptoe Sports Hub offer?',           answer: 'We offer Football and Futsal, Cricket, Basketball, Pickleball, Snooker, and a Sports Bar, all under one roof in Tarkeshwar, Kathmandu.' },
  { category: 'General',    order: 3,  active: true, question: 'What are your opening hours?',                                    answer: 'Mon–Fri: 6AM–9PM | Saturday: 6AM–8PM | Sunday: 7AM–12PM. Sports Bar: Mon–Thu 4PM–11PM, Fri–Sun 12PM–12AM. Hours may vary on public holidays.' },
  { category: 'Academy',    order: 4,  active: true, question: 'What age groups does Tiptoe Sports Academy accept?',             answer: 'Tiptoe Sports Academy accepts students from age 4 to 18. Programs: Football Foundation (Age 4–10), Youth Development (Age 11–15), Elite Performance (Age 16–18), Girls Football (Age 8–18), and Futsal Academy (all ages).' },
  { category: 'Academy',    order: 5,  active: true, question: 'Do you offer international exposure for students?',              answer: 'Yes! Selected students participate in annual Thailand training camps and international tournaments, including exposure to Thai Division clubs for elite players.' },
  { category: 'Academy',    order: 6,  active: true, question: 'How many students are currently enrolled?',                      answer: 'Tiptoe Sports Academy has 370+ active students enrolled across all programs, making us one of the largest private football & futsal academies in Nepal.' },
  { category: 'Academy',    order: 7,  active: true, question: 'Do you have a girls-only football program?',                     answer: 'Yes! Our Girls Football Program is open to ages 8–18, providing a safe, supportive, and empowering environment with female-focused coaching.' },
  { category: 'Academy',    order: 8,  active: true, question: 'How do I enroll my child in the academy?',                       answer: 'Fill in the enrollment form at /enroll, or contact us directly via phone or WhatsApp. We will schedule a trial session and confirm enrollment with program details and fees.' },
  { category: 'Pricing',    order: 9,  active: true, question: 'How much does it cost to join the football academy?',            answer: 'Football programs start from NPR 2,500/month (Age 4–10), NPR 3,000/month (Age 11–15), and NPR 3,500/month for the Elite program (Age 16–18). Futsal Academy is NPR 2,800/month. Girls Football is NPR 2,500/month.' },
  { category: 'Pricing',    order: 10, active: true, question: 'Is there a registration fee to join?',                           answer: 'Yes, there is a one-time registration and kit fee upon enrollment. Please contact us or visit the Pricing page for the latest amounts and any current promotions.' },
  { category: 'Pricing',    order: 11, active: true, question: 'Do you offer monthly or annual memberships?',                    answer: 'We offer monthly memberships for all sports. Basketball, Pickleball, and Snooker monthly memberships include unlimited access. Contact us for corporate group packages and seasonal discounts.' },
  { category: 'Sports Hub', order: 12, active: true, question: 'Can I book a cricket ground for a private match?',               answer: 'Yes! The full cricket ground is available for hire at NPR 3,000/session (2 hours). Net practice lanes are NPR 800/hr. Contact us to check availability and make a booking.' },
  { category: 'Sports Hub', order: 13, active: true, question: 'Is Pickleball beginner-friendly?',                               answer: 'Absolutely! We provide paddles and balls, run beginner coaching every Monday and Wednesday evening, and our staff will help you get started on day one.' },
  { category: 'Sports Hub', order: 14, active: true, question: 'Can I host a private event at the Sports Bar?',                  answer: 'Yes! The Sports Bar is available for private events for up to 50 guests, with exclusive venue hire, full catering, and live sports broadcasting. Contact us for a custom quote.' },
]

/* ── Stat card ─────────────────────────────────────────────────────────── */
const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  enrolled: 'bg-green/10 text-green',
  rejected: 'bg-red-100 text-red-600',
}

function StatCard({ label, value, Icon, color, to, loading }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
        <p className="font-black text-3xl text-navy">
          {loading ? <span className="animate-pulse bg-gray-200 rounded w-12 h-8 inline-block" /> : value}
        </p>
        {to && (
          <Link to={to} className="text-xs text-navy font-semibold flex items-center gap-1 mt-2 hover:text-gold transition-colors">
            Manage <MdArrowForward />
          </Link>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
        <Icon size={28} className="text-white" />
      </div>
    </motion.div>
  )
}

/* ── Main ──────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  const programsQ      = useMemo(() => query(programsCol), [])
  const eventsQ        = useMemo(() => query(eventsCol), [])
  const galleryQ       = useMemo(() => query(galleryCol), [])
  const recentQ        = useMemo(() => query(inquiriesCol, orderBy('createdAt', 'desc'), limit(10)), [])
  const allInquiriesQ  = useMemo(() => query(inquiriesCol), [])
  const allProgramsQ   = useMemo(() => query(programsCol), [])
  const allCoachesQ    = useMemo(() => query(coachesCol), [])
  const allScheduleQ   = useMemo(() => query(scheduleCol), [])
  const allSportsQ     = useMemo(() => query(sportsCol), [])
  const allPricingQ    = useMemo(() => query(pricingCol), [])
  const allFaqQ        = useMemo(() => query(faqCol), [])

  const { docs: programs,     loading: pLoad }   = useCollection(programsQ)
  const { docs: events,       loading: eLoad }   = useCollection(eventsQ)
  const { docs: gallery,      loading: gLoad }   = useCollection(galleryQ)
  const { docs: recent,       loading: rLoad }   = useCollection(recentQ)
  const { docs: allInquiries, loading: iLoad }   = useCollection(allInquiriesQ)
  const { docs: allPrograms,  loading: apLoad }  = useCollection(allProgramsQ)
  const { docs: allCoaches,   loading: acLoad }  = useCollection(allCoachesQ)
  const { docs: allSchedule,  loading: asLoad }  = useCollection(allScheduleQ)
  const { docs: allSports,    loading: assLoad } = useCollection(allSportsQ)
  const { docs: allPricing,   loading: prLoad }  = useCollection(allPricingQ)
  const { docs: allFaq,       loading: fqLoad }  = useCollection(allFaqQ)

  const newCount = allInquiries.filter(i => i.status === 'new').length
  const anyLoading = apLoad || acLoad || asLoad || assLoad || prLoad || fqLoad

  const needsSetup = !anyLoading && (
    allPrograms.length === 0 || allCoaches.length === 0 || allSchedule.length === 0 ||
    allSports.length === 0   || allPricing.length === 0 || allFaq.length === 0
  )

  const missingLabels = !anyLoading ? [
    allPrograms.length  === 0 && 'Programs',
    allCoaches.length   === 0 && 'Coaches',
    allSchedule.length  === 0 && 'Schedule',
    allSports.length    === 0 && 'Sports & Facilities',
    allPricing.length   === 0 && 'Pricing',
    allFaq.length       === 0 && 'FAQ',
  ].filter(Boolean) : []

  async function seedAll() {
    setSeeding(true)
    try {
      let count = 0
      const [pSnap, cSnap, sSnap, spSnap, prSnap, fqSnap] = await Promise.all([
        getDocs(programsCol),
        getDocs(coachesCol),
        getDocs(scheduleCol),
        getDocs(sportsCol),
        getDocs(pricingCol),
        getDocs(faqCol),
      ])

      if (pSnap.empty) {
        for (const item of SEED_PROGRAMS) await addDoc(programsCol, item)
        count += SEED_PROGRAMS.length
      }
      if (cSnap.empty) {
        for (const item of SEED_COACHES) await addDoc(coachesCol, item)
        count += SEED_COACHES.length
      }
      if (sSnap.empty) {
        for (const item of SEED_SCHEDULE) await addDoc(scheduleCol, item)
        count += SEED_SCHEDULE.length
      }
      if (spSnap.empty) {
        for (const item of SEED_SPORTS) await addDoc(sportsCol, item)
        count += SEED_SPORTS.length
      }
      if (prSnap.empty) {
        for (const item of SEED_PRICING) await addDoc(pricingCol, item)
        count += SEED_PRICING.length
      }
      if (fqSnap.empty) {
        for (const item of SEED_FAQ) await addDoc(faqCol, item)
        count += SEED_FAQ.length
      }

      if (count > 0) {
        toast.success(`${count} items seeded to Firestore! All sections now manageable.`)
        setSeeded(true)
      } else {
        toast.success('All content is already in Firestore.')
        setSeeded(true)
      }
    } catch (err) {
      toast.error('Seeding failed: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  function formatDate(ts) {
    if (!ts) return '-'
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-black text-2xl text-navy">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening.</p>
      </div>

      {/* Setup Banner — shows when Firestore is empty */}
      {!anyLoading && (needsSetup || seeded) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-5 border ${seeded && !needsSetup ? 'bg-green/5 border-green/20' : 'bg-amber-50 border-amber-200'}`}
        >
          {seeded && !needsSetup ? (
            <div className="flex items-center gap-3">
              <MdCheckCircle className="text-green text-2xl shrink-0" />
              <div>
                <p className="font-bold text-navy">Content seeded successfully!</p>
                <p className="text-gray-500 text-sm">All sections are now populated and manageable from the admin panel.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-amber-800 flex items-center gap-2">
                  <MdRocketLaunch /> Initial Setup Required
                </p>
                <p className="text-amber-700 text-sm mt-0.5">
                  The following sections are empty — they show hardcoded content on the website:
                  <span className="font-semibold"> {missingLabels.join(', ')}</span>.
                </p>
                <p className="text-amber-600 text-xs mt-1">
                  Click "Seed Default Content" to load all website content into Firestore so you can manage and edit it here.
                </p>
              </div>
              <button
                onClick={seedAll}
                disabled={seeding}
                className="btn-primary shrink-0 py-3 px-6 disabled:opacity-60 whitespace-nowrap"
              >
                {seeding ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Seeding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <MdRocketLaunch /> Seed Default Content
                  </span>
                )}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Inquiries"  value={allInquiries.length}                              Icon={MdInbox}        color="bg-navy"         to="/admin/inquiries" loading={iLoad} />
        <StatCard label="Active Programs"  value={programs.filter(p => p.active !== false).length} Icon={MdSportsScore}  color="bg-green"        to="/admin/programs"  loading={pLoad} />
        <StatCard label="Upcoming Events"  value={events.filter(e => e.isUpcoming === true).length} Icon={MdEventNote}   color="bg-gold"         to="/admin/events"    loading={eLoad} />
        <StatCard label="Gallery Items"    value={gallery.length}                                   Icon={MdPhotoLibrary} color="bg-purple-500"   to="/admin/gallery"   loading={gLoad} />
      </div>

      {/* New Inquiries Alert */}
      {newCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{newCount}</span>
            </div>
            <p className="text-blue-800 font-semibold text-sm">{newCount} new {newCount === 1 ? 'inquiry' : 'inquiries'} awaiting response</p>
          </div>
          <Link to="/admin/inquiries" className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            Review <MdArrowForward />
          </Link>
        </div>
      )}

      {/* Content Status Overview */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-navy text-base mb-4">Content Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {[
            { label: 'Sports',    count: allSports.length,   to: '/admin/sports',    loading: assLoad },
            { label: 'Programs',  count: allPrograms.length,  to: '/admin/programs',  loading: apLoad },
            { label: 'Coaches',   count: allCoaches.length,   to: '/admin/coaches',   loading: acLoad },
            { label: 'Schedule',  count: allSchedule.length,  to: '/admin/schedule',  loading: asLoad },
            { label: 'Pricing',   count: allPricing.length,   to: '/admin/pricing',   loading: prLoad },
            { label: 'FAQ',       count: allFaq.length,       to: '/admin/faq',       loading: fqLoad },
          ].map(({ label, count, to, loading }) => (
            <Link key={label} to={to}
              className={`rounded-xl p-3 border text-center hover:border-navy/30 transition-all ${count === 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'}`}>
              {loading
                ? <div className="h-6 bg-gray-200 rounded animate-pulse mb-1" />
                : <div className={`font-black text-2xl ${count === 0 ? 'text-amber-500' : 'text-navy'}`}>{count}</div>
              }
              <div className="text-gray-500 text-xs font-medium">{label}</div>
              {count === 0 && <div className="text-amber-600 text-[10px] mt-0.5 font-semibold">Empty - needs seed</div>}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">Recent Inquiries</h2>
          <Link to="/admin/inquiries" className="text-navy font-semibold text-sm flex items-center gap-1 hover:text-gold transition-colors">
            View All <MdArrowForward />
          </Link>
        </div>

        {rLoad ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}
          </div>
        ) : recent.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(inq => (
                  <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{inq.name}</div>
                      {inq.parentName && <div className="text-xs text-gray-400">Parent: {inq.parentName}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inq.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{inq.sport || '-'}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(inq.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[inq.status] || 'bg-gray-100 text-gray-600'}`}>
                        {inq.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400">
            <MdInbox size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No inquiries yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
