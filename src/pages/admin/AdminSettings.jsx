import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { MdSave, MdSettings } from 'react-icons/md'
import { FaInstagram, FaFacebook, FaTiktok } from 'react-icons/fa'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase/config'

const DEFAULTS = {
  academyName: 'Tiptoe Sports Hub',
  tagline: 'A Home for Future Players',
  phone: '',
  email: 'tiptoesportshub@gmail.com',
  address: 'Tarkeshwar, Kathmandu, Nepal',
  whatsapp: '9779800000000',
  logoURL: '',
  academyLogoURL: '',
  mapsLink: 'https://maps.app.goo.gl/qSVDwXY53wtm5F576',
  mapsEmbedURL: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.58!2d85.3047!3d27.7368!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb199a534fb789%3A0x9b5cd5299ace8bc!2sTarkeshwar%2C+Kathmandu!5e0!3m2!1sen!2snp!4v1',
  hoursWeekdays: '6 AM – 9 PM',
  hoursSaturday: '6 AM – 8 PM',
  hoursSunday: '7 AM – 12 PM',
  socialLinks: {
    instagram: 'https://www.instagram.com/tiptoesportshub',
    facebook: 'https://www.facebook.com/tiptoeacademy',
    tiktok: 'https://www.tiktok.com/@tiptoesportshub1504',
  },
}

export default function AdminSettings() {
  const [form, setForm] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'main'))
        if (snap.exists()) {
          const data = snap.data()
          setForm({ ...DEFAULTS, ...data, socialLinks: { ...DEFAULTS.socialLinks, ...(data.socialLinks || {}) } })
        }
      } catch { toast.error('Failed to load settings.') }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setSocial = (k, v) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [k]: v } }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'main'), { ...form })
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save settings.') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-black text-2xl text-navy">Settings</h1>
          <p className="text-gray-500 text-sm">Academy information and preferences</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2.5 disabled:opacity-60">
          <MdSave size={18} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Hub Logo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-1">Hub Logo</h2>
        <p className="text-xs text-gray-400 mb-4">Used in the navbar and hub-related pages.</p>
        <div className="flex items-center gap-4 mb-2">
          {form.logoURL
            ? <img src={form.logoURL} alt="Hub Logo" className="w-20 h-20 object-contain rounded-xl border border-gray-200" onError={e => e.target.style.display='none'} />
            : <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><MdSettings size={32} /></div>
          }
          <div className="flex-1">
            <input
              value={form.logoURL}
              onChange={e => set('logoURL', e.target.value)}
              className="input-field text-sm"
              placeholder="Paste Hub logo image URL"
            />
            <p className="text-xs text-gray-400 mt-1">Upload to <strong>imgur.com</strong> free, then paste the direct link here.</p>
          </div>
        </div>
      </div>

      {/* Academy Logo */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-1">Academy Logo</h2>
        <p className="text-xs text-gray-400 mb-4">Used on Academy pages (Football Academy, Futsal Academy, Coaches, Programs).</p>
        <div className="flex items-center gap-4 mb-2">
          {form.academyLogoURL
            ? <img src={form.academyLogoURL} alt="Academy Logo" className="w-20 h-20 object-contain rounded-xl border border-gray-200" onError={e => e.target.style.display='none'} />
            : <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300"><MdSettings size={32} /></div>
          }
          <div className="flex-1">
            <input
              value={form.academyLogoURL}
              onChange={e => set('academyLogoURL', e.target.value)}
              className="input-field text-sm"
              placeholder="Paste Academy logo image URL"
            />
            <p className="text-xs text-gray-400 mt-1">Upload to <strong>imgur.com</strong> free, then paste the direct link here.</p>
          </div>
        </div>
      </div>

      {/* Academy Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-5">Academy Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Academy Name</label>
            <input value={form.academyName} onChange={e => set('academyName', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tagline</label>
            <input value={form.tagline} onChange={e => set('tagline', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => set('phone', e.target.value)} className="input-field" placeholder="+977 98XXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address</label>
            <input value={form.address} onChange={e => set('address', e.target.value)} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Google Maps Link</label>
            <input value={form.mapsLink || ''} onChange={e => set('mapsLink', e.target.value)} className="input-field" placeholder="https://maps.google.com/?q=..." />
            <p className="text-xs text-gray-400 mt-1">Used for the address link in the footer and contact page.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Maps Embed URL</label>
            <input value={form.mapsEmbedURL || ''} onChange={e => set('mapsEmbedURL', e.target.value)} className="input-field" placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-xs text-gray-400 mt-1">Paste the embed URL from Google Maps &gt; Share &gt; Embed a map &gt; copy the src value.</p>
          </div>
        </div>
      </div>

      {/* Opening Hours */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-1">Opening Hours</h2>
        <p className="text-xs text-gray-400 mb-4">Shown in the website footer. Update if your hours change.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mon – Fri</label>
            <input value={form.hoursWeekdays || ''} onChange={e => set('hoursWeekdays', e.target.value)} className="input-field" placeholder="6 AM – 9 PM" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Saturday</label>
            <input value={form.hoursSaturday || ''} onChange={e => set('hoursSaturday', e.target.value)} className="input-field" placeholder="6 AM – 8 PM" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sunday</label>
            <input value={form.hoursSunday || ''} onChange={e => set('hoursSunday', e.target.value)} className="input-field" placeholder="7 AM – 12 PM" />
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-4">WhatsApp</h2>
        <div className="max-w-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp Number</label>
          <input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value.replace(/\D/g, ''))} className="input-field" placeholder="9779841416893" />
          <p className="text-xs text-gray-400 mt-1">Digits only, no spaces or dashes. Nepal format: 977 then the 10-digit number (e.g. 9779841416893).</p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-bold text-navy mb-5">Social Media Links</h2>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FaInstagram className="text-pink-500" /> Instagram URL
            </label>
            <input value={form.socialLinks.instagram} onChange={e => setSocial('instagram', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FaFacebook className="text-blue-600" /> Facebook URL
            </label>
            <input value={form.socialLinks.facebook} onChange={e => setSocial('facebook', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <FaTiktok /> TikTok URL
            </label>
            <input value={form.socialLinks.tiktok} onChange={e => setSocial('tiktok', e.target.value)} className="input-field" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
          <MdSave size={18} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  )
}
