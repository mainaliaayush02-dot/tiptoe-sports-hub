import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaInstagram, FaFacebook, FaTiktok, FaArrowRight, FaPaperPlane, FaExternalLinkAlt } from 'react-icons/fa'
import { addDocument } from '../hooks/useFirestore'
import { inquiriesCol } from '../firebase/collections'
import { useSite } from '../contexts/SiteContext'
import SEOHead from '../components/SEOHead'
import { sendContactEmail } from '../utils/emailNotification'

const SPORT_OPTIONS = ['Football', 'Futsal', 'Cricket', 'Basketball', 'Pickleball', 'Snooker', 'Sports Lounge', 'Not Sure Yet']

export default function Contact() {
  const { phone, email, address, mapsLink, mapsEmbedURL, socialLinks } = useSite()
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await addDocument(inquiriesCol, { ...data, sport: data.sport || '', message: data.message || '', status: 'new' })
      sendContactEmail(data) // fire-and-forget — Firestore is the source of truth
      toast.success("Message sent! We'll get back to you shortly.")
      reset()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SEOHead
        title="Contact Tiptoe Sports Hub, Kathmandu"
        description="Contact Tiptoe Sports Hub in Tarakeshwar, Kathmandu. Call 984-1416893 or 970-7079773. Book courts, ask about programs or get directions to our facility."
        path="/contact"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="badge-gold mb-5">Contact</span>
            <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Contact Us in Kathmandu</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Questions about our football academy or sports facilities? We would love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4 md:px-8 bg-light">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white rounded-2xl shadow-card p-8">
              <h2 className="font-heading font-bold text-2xl text-navy mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                    <input {...register('name', { required: 'Required' })} className={`input-field ${errors.name ? 'border-red-400' : ''}`} placeholder="Your full name" />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                    <input {...register('phone', { required: 'Required' })} className={`input-field ${errors.phone ? 'border-red-400' : ''}`} placeholder="+977 98XXXXXXXX" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input {...register('email')} type="email" className="input-field" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sport Interest</label>
                  <select {...register('sport')} className="input-field">
                    <option value="">Select sport...</option>
                    {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea {...register('message')} rows={4} className="input-field resize-none" placeholder="How can we help you?" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5 disabled:opacity-60">
                  {submitting ? 'Sending...' : <><FaPaperPlane size={14} /> Send Message</>}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Map + Info */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-card border border-gray-100" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                title="Tiptoe Sports Hub location map - Tarakeshwar, Kathmandu"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.0824918697235!2d85.2996584113474!3d27.745601523703204!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb19001f6e5691%3A0x5b88aea185c7918a!2sTipToe%20Sports%20Hub!5e0!3m2!1sen!2snp!4v1782289068362!5m2!1sen!2snp"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* Get Directions */}
            <a
              href="https://maps.app.goo.gl/GXdjUV3qQX4Rm61o7"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-dark transition-colors"
            >
              <FaMapMarkerAlt size={14} /> Get Directions to Tiptoe Sports Hub
            </a>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-heading font-bold text-navy text-lg mb-5">Contact Information</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                    <FaMapMarkerAlt className="text-navy" size={14} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Address</div>
                    <a href={mapsLink} target="_blank" rel="noopener noreferrer"
                      className="text-gray-500 text-sm hover:text-navy transition-colors flex items-center gap-1 mt-0.5">
                      {address} <FaExternalLinkAlt size={9} />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                      <FaPhoneAlt className="text-navy" size={13} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Phone</div>
                      <a href="tel:+977-984-1416893" className="text-gray-500 text-sm hover:text-navy transition-colors mt-0.5 block">+977-984-1416893</a>
                      <a href="tel:+977-970-7079773" className="text-gray-500 text-sm hover:text-navy transition-colors mt-0.5 block">+977-970-7079773</a>
                    </div>
                  </li>
                {email && (
                  <li className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                      <FaEnvelope className="text-navy" size={14} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 text-sm">Email</div>
                      <a href={`mailto:${email}`} className="text-gray-500 text-sm hover:text-navy transition-colors mt-0.5 block">{email}</a>
                    </div>
                  </li>
                )}
              </ul>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-3">Follow us</p>
                <div className="flex gap-2.5">
                  {[
                    { href: socialLinks.instagram, Icon: FaInstagram, label: 'Instagram' },
                    { href: socialLinks.facebook, Icon: FaFacebook, label: 'Facebook' },
                    { href: socialLinks.tiktok, Icon: FaTiktok, label: 'TikTok' },
                  ].map(({ href, Icon, label }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                      className="w-9 h-9 bg-navy/5 rounded-lg flex items-center justify-center text-navy hover:bg-gold hover:text-navy transition-all">
                      <Icon size={15} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
