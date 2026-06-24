import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa'
import { GiSoccerBall } from 'react-icons/gi'
import { addDocument } from '../hooks/useFirestore'
import { inquiriesCol } from '../firebase/collections'
import SEOHead from '../components/SEOHead'
import { sendEnrollmentEmail } from '../utils/emailNotification'

const SPORTS = ['Football', 'Futsal', 'Cricket', 'Basketball', 'Pickleball', 'Snooker', 'Sports Lounge', 'Not Sure Yet']
const AGE_GROUPS = ['Age 4–10', 'Age 11–15', 'Age 16–18', 'All Ages']
const SCHEDULES = ['Morning (5:00–7:00 AM)', 'Afternoon (3:00–5:00 PM)', 'Evening (5:00–7:00 PM)', 'Weekend Only']

export default function Enroll() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setSubmitting(true)
    try {
      await addDocument(inquiriesCol, { ...data, status: 'new' })
      sendEnrollmentEmail(data) // fire-and-forget — Firestore is the source of truth
      setSubmitted(true)
      toast.success('Enrollment inquiry submitted successfully!')
    } catch (e) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <>
        <SEOHead title="Enrollment Submitted" description="Your enrollment inquiry has been received." path="/enroll" noindex />
        <div className="min-h-screen pt-28 flex items-center justify-center px-4 bg-light">
          <motion.div className="card max-w-md w-full p-10 text-center" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <FaCheckCircle className="text-6xl text-green mx-auto mb-5" />
            <h2 className="font-black text-2xl text-navy mb-3">Enrollment Submitted!</h2>
            <p className="text-gray-600 mb-6">Thank you for your interest in Tiptoe Sports Hub. Our team will contact you within 24 hours to confirm your enrollment.</p>
            <div className="bg-gold/10 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 font-semibold mb-2">What's next?</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Our team will call you within 24 hours</li>
                <li>✓ We'll discuss the best program for you</li>
                <li>✓ You'll be invited for a trial session</li>
                <li>✓ Complete enrollment &amp; start training!</li>
              </ul>
            </div>
            <Link to="/" className="btn-primary justify-center">Back to Home <FaArrowRight /></Link>
          </motion.div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead
        title="Enroll at Tiptoe Sports Academy in Kathmandu"
        description="Enroll at Tiptoe Sports Academy, Kathmandu. Football and futsal programs for ages 4-18. Fill in the form and our team will contact you within 24 hours."
        path="/enroll"
        breadcrumb
      />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#06145F_0%,_#030A2E_60%)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-green/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="badge-gold mb-5">Join Us</span>
            <h1 className="font-black text-5xl md:text-6xl text-white leading-tight mt-4 mb-4">Enroll at Tiptoe Sports Academy</h1>
            <p className="text-white/60 max-w-xl mx-auto text-lg">Fill out the form and our team will contact you within 24 hours to find the right program for your child in Kathmandu.</p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 px-4 bg-light" id="form">
        <div className="max-w-3xl mx-auto">
          <motion.div className="bg-white rounded-2xl shadow-md p-8 md:p-10" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-navy rounded-xl flex items-center justify-center">
                <GiSoccerBall className="text-gold text-2xl" />
              </div>
              <div>
                <h2 className="font-black text-2xl text-navy">Enrollment Inquiry</h2>
                <p className="text-gray-500 text-sm">No commitment. Just the first step.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Student Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Name *</label>
                  <input
                    {...register('name', { required: 'Required' })}
                    className={`input-field ${errors.name ? 'border-red-400 ring-red-200' : ''}`}
                    placeholder="Student's full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student Age *</label>
                  <input
                    {...register('age', { required: 'Required', min: { value: 4, message: 'Min age 4' }, max: { value: 18, message: 'Max age 18' } })}
                    type="number"
                    className={`input-field ${errors.age ? 'border-red-400' : ''}`}
                    placeholder="Age (years)"
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Parent/Guardian Name *</label>
                  <input
                    {...register('parentName', { required: 'Required' })}
                    className={`input-field ${errors.parentName ? 'border-red-400' : ''}`}
                    placeholder="Parent's full name"
                  />
                  {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
                  <input
                    {...register('phone', { required: 'Required' })}
                    className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    placeholder="+977 98XXXXXXXX"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input-field"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Sport */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sport *</label>
                  <select
                    {...register('sport', { required: 'Required' })}
                    className={`input-field ${errors.sport ? 'border-red-400' : ''}`}
                  >
                    <option value="">Select sport...</option>
                    {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.sport && <p className="text-red-500 text-xs mt-1">{errors.sport.message}</p>}
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age Group</label>
                  <select {...register('ageGroup')} className="input-field">
                    <option value="">Select age group...</option>
                    {AGE_GROUPS.map(ag => <option key={ag} value={ag}>{ag}</option>)}
                  </select>
                </div>

                {/* Preferred Schedule */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Schedule</label>
                  <select {...register('preferredSchedule')} className="input-field">
                    <option value="">Select schedule...</option>
                    {SCHEDULES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Message</label>
                <textarea
                  {...register('message')}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Any questions, special requirements, or information about the student..."
                />
              </div>

              {/* Benefits */}
              <div className="bg-light rounded-xl p-4">
                <p className="text-sm font-semibold text-navy mb-2">What happens after you submit?</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green shrink-0" /> Our team calls within 24 hours</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green shrink-0" /> We match you with the right program</li>
                  <li className="flex items-center gap-2"><FaCheckCircle className="text-green shrink-0" /> Free trial session invitation</li>
                </ul>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
                {submitting ? 'Submitting...' : <>Submit Enrollment Inquiry <FaArrowRight /></>}
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Internal Links */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-navy text-center text-lg mb-6">Learn More Before You Enroll</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { to: '/programs',  label: 'Training Programs',            emoji: '📋' },
              { to: '/pricing',   label: 'Membership & Pricing',         emoji: '💰' },
              { to: '/coaches',   label: 'Meet Our Coaches',             emoji: '🧑‍🏫' },
              { to: '/faq',       label: 'Frequently Asked Questions',   emoji: '❓' },
              { to: '/sports/football-futsal', label: 'Football & Futsal', emoji: '⚽' },
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
