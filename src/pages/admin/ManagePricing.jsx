import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdAttachMoney } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { pricingCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const SPORTS = ['Football', 'Cricket', 'Basketball', 'Pickleball', 'Snooker', 'Sports Bar', 'General']
const PERIODS = ['/month', '/session', '/hour', '/week', '/day', 'Custom']
const BADGES = ['', 'Popular', 'Best Value', 'Trending', 'New', 'Members Only']

const EMPTY = { sport: 'Football', title: '', price: '', period: '/month', features: '', badge: '', active: true, order: 0 }

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title || !form.price) { toast.error('Title and price are required.'); return }
    setSaving(true)
    try {
      const features = form.features
        ? form.features.split('\n').map(s => s.trim()).filter(Boolean)
        : []
      await onSave({ ...form, features })
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  const featuresText = Array.isArray(form.features)
    ? form.features.join('\n')
    : form.features || ''

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Pricing Plan' : 'Add Pricing Plan'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><MdClose size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sport / Category *</label>
              <select value={form.sport} onChange={e => set('sport', e.target.value)} className="input-field">
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
              <select value={form.badge} onChange={e => set('badge', e.target.value)} className="input-field">
                {BADGES.map(b => <option key={b} value={b}>{b || '— None —'}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Plan Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input-field" placeholder="e.g. Youth Development Program" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Price *</label>
              <input value={form.price} onChange={e => set('price', e.target.value)} className="input-field" placeholder="NPR 2,500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Period</label>
              <select value={form.period} onChange={e => set('period', e.target.value)} className="input-field">
                {PERIODS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Features <span className="text-gray-400 font-normal">(one per line)</span></label>
              <textarea
                value={featuresText}
                onChange={e => set('features', e.target.value)}
                rows={5}
                className="input-field resize-none"
                placeholder={"3 sessions/week\nAge 4–10\nCertified coaching\nKit included"}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <label className="text-sm font-semibold text-gray-700">Active</label>
              <button type="button" onClick={() => set('active', !form.active)}
                className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${form.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const SPORT_COLORS = {
  Football: 'bg-navy/10 text-navy',
  Cricket: 'bg-green/10 text-green',
  Basketball: 'bg-orange-100 text-orange-700',
  Pickleball: 'bg-emerald-100 text-emerald-700',
  Snooker: 'bg-purple-100 text-purple-700',
  'Sports Bar': 'bg-amber-100 text-amber-700',
  General: 'bg-gray-100 text-gray-600',
}

export default function ManagePricing() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterSport, setFilterSport] = useState('All')
  const q = useMemo(() => query(pricingCol, orderBy('order')), [])
  const { docs: plans, loading } = useCollection(q)

  const filtered = filterSport === 'All' ? plans : plans.filter(p => p.sport === filterSport)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('pricing', id, data)
      toast.success('Plan updated!')
    } else {
      await addDocument(pricingCol, form)
      toast.success('Plan added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('pricing', deleteId)
    toast.success('Plan deleted.')
    setDeleteId(null)
  }

  const toggleActive = async (plan) => {
    await updateDocument('pricing', plan.id, { active: !plan.active })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Membership & Pricing</h1>
          <p className="text-gray-500 text-sm">{plans.length} pricing plans</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5">
          <MdAdd size={18} /> Add Plan
        </button>
      </div>

      {/* Sport filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...SPORTS].map(s => (
          <button key={s} onClick={() => setFilterSport(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterSport === s ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Features</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(plan => (
                  <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{plan.title}</div>
                      {plan.badge && <span className="text-[10px] bg-gold/20 text-[#c47d00] font-bold px-2 py-0.5 rounded-full">{plan.badge}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${SPORT_COLORS[plan.sport] || 'bg-gray-100 text-gray-600'}`}>{plan.sport}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-navy">{plan.price}</span>
                      <span className="text-gray-400 text-xs ml-1">{plan.period}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px]">
                      {Array.isArray(plan.features) && plan.features.length > 0
                        ? plan.features.slice(0, 2).join(', ') + (plan.features.length > 2 ? ` +${plan.features.length - 2} more` : '')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(plan)}
                        className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${plan.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(plan)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdAttachMoney size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No pricing plans yet.</p>
            <p className="text-sm mt-1">Add your first plan to display it on the website.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && (
          <Modal
            item={modal.id ? { ...modal, features: Array.isArray(modal.features) ? modal.features.join('\n') : modal.features || '' } : null}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Pricing Plan?</h3>
              <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
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
