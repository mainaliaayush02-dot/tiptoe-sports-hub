import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdSportsTennis } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { sportsCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const EMPTY = {
  name: '',
  slug: '',
  emoji: '⚽',
  tagline: '',
  description: '',
  facilities: '',
  pricing: '',
  schedule: '',
  imageURL: '',
  seoTitle: '',
  seoDescription: '',
  color: '#06145F',
  active: true,
  order: 0,
}

const SLUG_SUGGESTIONS = [
  { slug: 'football-futsal', emoji: '⚽', name: 'Football / Futsal' },
  { slug: 'cricket',         emoji: '🏏', name: 'Cricket' },
  { slug: 'basketball',      emoji: '🏀', name: 'Basketball' },
  { slug: 'pickleball',      emoji: '🎾', name: 'Pickleball' },
  { slug: 'snooker',         emoji: '🎱', name: 'Snooker' },
  { slug: 'sports-bar',      emoji: '🍹', name: 'Sports Bar' },
]

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.slug) { toast.error('Name and slug are required.'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Sport' : 'Add Sport'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><MdClose size={22} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick-fill suggestions */}
          {!item?.id && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Quick Fill</p>
              <div className="flex flex-wrap gap-2">
                {SLUG_SUGGESTIONS.map(s => (
                  <button key={s.slug} type="button"
                    onClick={() => setForm(f => ({ ...f, name: s.name, slug: s.slug, emoji: s.emoji }))}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:border-navy hover:text-navy transition-colors font-medium"
                  >
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sport Name *</label>
              <input
                value={form.name}
                onChange={e => { set('name', e.target.value); if (!item?.id) set('slug', toSlug(e.target.value)) }}
                className="input-field"
                placeholder="Basketball"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)} className="input-field" placeholder="🏀" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                URL Slug * <span className="text-gray-400 font-normal">(used in /sports/slug)</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm shrink-0">/sports/</span>
                <input value={form.slug} onChange={e => set('slug', toSlug(e.target.value))} className="input-field" placeholder="basketball" />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tagline</label>
              <input value={form.tagline} onChange={e => set('tagline', e.target.value)} className="input-field" placeholder="Court Training & Open Play" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-field resize-none" placeholder="Full description shown on the sport page..." />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Facilities <span className="text-gray-400 font-normal">(one per line)</span>
              </label>
              <textarea value={form.facilities} onChange={e => set('facilities', e.target.value)} rows={3} className="input-field resize-none font-mono text-xs" placeholder={"Full-size basketball court\nScoreboard & timing system\nLocker rooms"} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Pricing / Membership <span className="text-gray-400 font-normal">(one plan per line, e.g. "Monthly Membership – NPR 4,000/month")</span>
              </label>
              <textarea value={form.pricing} onChange={e => set('pricing', e.target.value)} rows={3} className="input-field resize-none font-mono text-xs" placeholder={"Court Hire (1 hr) – NPR 1,500/hr\nMonthly Membership – NPR 4,000/month"} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule</label>
              <input value={form.schedule} onChange={e => set('schedule', e.target.value)} className="input-field" placeholder="Mon–Fri: 6AM–10PM | Sat–Sun: 7AM–10PM" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image URL</label>
              <input value={form.imageURL} onChange={e => set('imageURL', e.target.value)} className="input-field" placeholder="https://i.imgur.com/..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Accent Color <span className="text-gray-400 font-normal">(hex)</span>
              </label>
              <div className="flex gap-2">
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <input value={form.color} onChange={e => set('color', e.target.value)} className="input-field flex-1" placeholder="#06145F" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} className="input-field" />
            </div>
          </div>

          {/* SEO */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">SEO Settings</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Title</label>
                <input value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} className="input-field" placeholder="Basketball in Kathmandu | Tiptoe Sports Hub" />
                <p className="text-xs text-gray-400 mt-0.5">{form.seoTitle.length}/60 chars recommended</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">SEO Description</label>
                <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={2} className="input-field resize-none" placeholder="Premium basketball courts and training in Tarkeshwar, Kathmandu..." />
                <p className="text-xs text-gray-400 mt-0.5">{form.seoDescription.length}/160 chars recommended</p>
              </div>
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3 pt-1">
            <button type="button" onClick={() => set('active', !form.active)}
              className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${form.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow" />
            </button>
            <span className="text-sm font-medium text-gray-700">{form.active ? 'Active (visible on website)' : 'Hidden'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Sport'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageSports() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(sportsCol, orderBy('order')), [])
  const { docs: sports, loading } = useCollection(q)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('sports', id, data)
      toast.success('Sport updated!')
    } else {
      await addDocument(sportsCol, form)
      toast.success('Sport added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('sports', deleteId)
    toast.success('Sport deleted.')
    setDeleteId(null)
  }

  const toggleActive = async (sport) => {
    await updateDocument('sports', sport.id, { active: !sport.active })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Sports & Facilities</h1>
          <p className="text-gray-500 text-sm">{sports.length} sport pages · manage public sport pages and SEO</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5">
          <MdAdd size={18} /> Add Sport
        </button>
      </div>

      {/* Seed prompt if empty */}
      {!loading && sports.length === 0 && (
        <div className="bg-gold/10 border border-gold/30 rounded-xl p-5 mb-5">
          <p className="text-sm font-semibold text-navy mb-1">No sports added yet.</p>
          <p className="text-sm text-gray-600 mb-3">Add your 5 core sports: Football/Futsal, Basketball, Pickleball, Snooker, and Sports Bar. Use the quick-fill buttons in the form.</p>
          <button onClick={() => setModal({})} className="btn-primary text-xs py-2">
            <MdAdd size={14} /> Add First Sport
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : sports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">URL Slug</th>
                  <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Tagline</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sports.map(sport => (
                  <tr key={sport.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{sport.emoji || '🏆'}</span>
                        <span className="font-semibold text-navy">{sport.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">/sports/{sport.slug}</code>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px] truncate">{sport.tagline || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(sport)}
                        className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${sport.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(sport)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(sport.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {modal !== null && <Modal item={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Sport?</h3>
              <p className="text-gray-500 text-sm mb-5">This will remove the sport page. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
