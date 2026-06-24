import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'

// Public pages — loaded eagerly (users visit these directly)
import Home        from './pages/Home'
import About       from './pages/About'
import Academy     from './pages/Academy'
import Programs    from './pages/Programs'
import Coaches     from './pages/Coaches'
import Schedule    from './pages/Schedule'
import Events      from './pages/Events'
import Gallery     from './pages/Gallery'
import Blog        from './pages/Blog'
import BlogPost    from './pages/BlogPost'
import Testimonials from './pages/Testimonials'
import Contact     from './pages/Contact'
import Enroll      from './pages/Enroll'
import SportPage   from './pages/sports/SportPage'
import Pricing     from './pages/Pricing'
import FAQ         from './pages/FAQ'
import NotFound    from './pages/NotFound'

// Admin pages — lazy loaded. Keeps quill/react-quill out of the SSR bundle
// (quill calls document.createElement on import, crashing Node.js)
const AdminLogin        = lazy(() => import('./pages/admin/AdminLogin'))
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard         = lazy(() => import('./pages/admin/Dashboard'))
const ManageSports      = lazy(() => import('./pages/admin/ManageSports'))
const ManagePrograms    = lazy(() => import('./pages/admin/ManagePrograms'))
const ManageCoaches     = lazy(() => import('./pages/admin/ManageCoaches'))
const ManageSchedule    = lazy(() => import('./pages/admin/ManageSchedule'))
const ManageEvents      = lazy(() => import('./pages/admin/ManageEvents'))
const ManageGallery     = lazy(() => import('./pages/admin/ManageGallery'))
const ManageBlog        = lazy(() => import('./pages/admin/ManageBlog'))
const ManageTestimonials = lazy(() => import('./pages/admin/ManageTestimonials'))
const ManageInquiries   = lazy(() => import('./pages/admin/ManageInquiries'))
const AdminSettings     = lazy(() => import('./pages/admin/AdminSettings'))
const ManagePricing     = lazy(() => import('./pages/admin/ManagePricing'))
const ManageFAQ         = lazy(() => import('./pages/admin/ManageFAQ'))
const ManageBoardMembers = lazy(() => import('./pages/admin/ManageBoardMembers'))

// Spinner shown while lazy admin chunks load
function AdminLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="academy" element={<Academy />} />
        <Route path="programs" element={<Programs />} />
        <Route path="coaches" element={<Coaches />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="events" element={<Events />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="testimonials" element={<Testimonials />} />
        <Route path="contact" element={<Contact />} />
        <Route path="enroll" element={<Enroll />} />
        <Route path="sports/:slug" element={<SportPage />} />
        <Route path="sports/sports-bar" element={<Navigate to="/sports/sports-lounge" replace />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<FAQ />} />
      </Route>

      {/* Admin routes — all lazy loaded */}
      <Route path="/admin/login" element={
        <Suspense fallback={<AdminLoader />}><AdminLogin /></Suspense>
      } />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={
          <Suspense fallback={<AdminLoader />}><AdminLayout /></Suspense>
        }>
          <Route index element={<Suspense fallback={null}><Dashboard /></Suspense>} />
          <Route path="sports"        element={<Suspense fallback={null}><ManageSports /></Suspense>} />
          <Route path="programs"      element={<Suspense fallback={null}><ManagePrograms /></Suspense>} />
          <Route path="coaches"       element={<Suspense fallback={null}><ManageCoaches /></Suspense>} />
          <Route path="schedule"      element={<Suspense fallback={null}><ManageSchedule /></Suspense>} />
          <Route path="events"        element={<Suspense fallback={null}><ManageEvents /></Suspense>} />
          <Route path="gallery"       element={<Suspense fallback={null}><ManageGallery /></Suspense>} />
          <Route path="blog"          element={<Suspense fallback={null}><ManageBlog /></Suspense>} />
          <Route path="testimonials"  element={<Suspense fallback={null}><ManageTestimonials /></Suspense>} />
          <Route path="inquiries"     element={<Suspense fallback={null}><ManageInquiries /></Suspense>} />
          <Route path="pricing"       element={<Suspense fallback={null}><ManagePricing /></Suspense>} />
          <Route path="faq"           element={<Suspense fallback={null}><ManageFAQ /></Suspense>} />
          <Route path="board-members" element={<Suspense fallback={null}><ManageBoardMembers /></Suspense>} />
          <Route path="settings"      element={<Suspense fallback={null}><AdminSettings /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
