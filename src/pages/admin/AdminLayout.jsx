import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdDashboard, MdSportsScore, MdEventNote, MdSettings, MdLogout, MdMenu, MdClose,
  MdPeople, MdSchedule, MdPhotoLibrary, MdArticle, MdStar, MdInbox, MdSportsTennis,
  MdAttachMoney, MdQuestionAnswer, MdGroups,
} from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', Icon: MdDashboard, end: true },
  { to: '/admin/sports',   label: 'Sports & Facilities', Icon: MdSportsTennis },
  { to: '/admin/programs', label: 'Programs', Icon: MdSportsScore },
  { to: '/admin/coaches', label: 'Coaches', Icon: MdPeople },
  { to: '/admin/schedule', label: 'Schedule', Icon: MdSchedule },
  { to: '/admin/events', label: 'Events', Icon: MdEventNote },
  { to: '/admin/gallery', label: 'Gallery', Icon: MdPhotoLibrary },
  { to: '/admin/blog', label: 'Blog', Icon: MdArticle },
  { to: '/admin/testimonials', label: 'Testimonials', Icon: MdStar },
  { to: '/admin/inquiries', label: 'Inquiries', Icon: MdInbox },
  { to: '/admin/pricing', label: 'Pricing', Icon: MdAttachMoney },
  { to: '/admin/faq', label: 'FAQ', Icon: MdQuestionAnswer },
  { to: '/admin/board-members', label: 'Board of Directors', Icon: MdGroups },
  { to: '/admin/settings', label: 'Settings', Icon: MdSettings },
]

function Sidebar({ onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out successfully.')
    navigate('/admin/login')
  }

  return (
    <div className="flex flex-col h-full bg-navy">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
        <div className="w-9 h-9 bg-white rounded-lg p-1 flex items-center justify-center shrink-0">
          <img src="/logo.jpeg" alt="Logo" className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none' }} />
        </div>
        <div className="leading-tight">
          <div className="text-white font-black text-sm tracking-tight leading-none">TIPTOE</div>
          <div className="text-gold font-semibold text-[9px] tracking-[0.18em] uppercase">Sports Hub</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/60 hover:text-white">
            <MdClose size={22} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-white/15 text-white border-r-4 border-gold'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-all"
        >
          <MdLogout size={20} /> Logout
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-60 z-50 lg:hidden flex flex-col"
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <Sidebar onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center gap-4 shrink-0">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-500 hover:text-navy">
            <MdMenu size={24} />
          </button>
          <span className="font-bold text-navy text-sm md:text-base">
            Tiptoe Sports Hub Admin
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
