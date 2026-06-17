import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminLayout from './pages/admin/AdminLayout'

import Home from './pages/Home'
import About from './pages/About'
import Academy from './pages/Academy'
import Programs from './pages/Programs'
import Coaches from './pages/Coaches'
import Schedule from './pages/Schedule'
import Events from './pages/Events'
import Gallery from './pages/Gallery'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import Enroll from './pages/Enroll'
import SportPage from './pages/sports/SportPage'
import Pricing from './pages/Pricing'
import FAQ from './pages/FAQ'
import NotFound from './pages/NotFound'

import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import ManageSports from './pages/admin/ManageSports'
import ManagePrograms from './pages/admin/ManagePrograms'
import ManageCoaches from './pages/admin/ManageCoaches'
import ManageSchedule from './pages/admin/ManageSchedule'
import ManageEvents from './pages/admin/ManageEvents'
import ManageGallery from './pages/admin/ManageGallery'
import ManageBlog from './pages/admin/ManageBlog'
import ManageTestimonials from './pages/admin/ManageTestimonials'
import ManageInquiries from './pages/admin/ManageInquiries'
import AdminSettings from './pages/admin/AdminSettings'
import ManagePricing from './pages/admin/ManagePricing'
import ManageFAQ from './pages/admin/ManageFAQ'

export default function App() {
  return (
    <Routes>
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
        <Route path="pricing" element={<Pricing />} />
        <Route path="faq" element={<FAQ />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="sports" element={<ManageSports />} />
          <Route path="programs" element={<ManagePrograms />} />
          <Route path="coaches" element={<ManageCoaches />} />
          <Route path="schedule" element={<ManageSchedule />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="gallery" element={<ManageGallery />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="testimonials" element={<ManageTestimonials />} />
          <Route path="inquiries" element={<ManageInquiries />} />
          <Route path="pricing" element={<ManagePricing />} />
          <Route path="faq" element={<ManageFAQ />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
