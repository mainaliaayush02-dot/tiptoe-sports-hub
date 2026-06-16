import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdSportsScore } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { programsCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const EMPTY = { name: '', sport: 'Football', ageGroup: '', description: '', schedule: '', fee: '', emoji: '⚽', active: true, order: 0 }
const SPORTS = ['Football', 'Futsal', 'Basketball', 'Pickleball', 'Snooker', 'Special']
const AGE_GROUPS = ['Age 4-10', 'Age 11-15', 'Age 16-18', 'All Ages', 'Selected']

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.sport) { toast.error('Name and sport are required.'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Program' : 'Add Program'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><MdClose size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Program Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="Football Academy" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Emoji</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)} className="input-field" placeholder="&#x26BD;" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sport *</label>
              <select value={form.sport} onChange={e => set('sport', e.target.value)} className="input-field">
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age Group</label>
              <select value={form.ageGroup} onChange={e => set('ageGroup', e.target.value)} className="input-field">
                <option value="">Select...</option>
                {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Schedule</label>
              <input value={form.schedule} onChange={e => set('schedule', e.target.value)} className="input-field" placeholder="Mon, Wed, Fri 5-7 PM" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Fee</label>
              <input value={form.fee} onChange={e => set('fee', e.target.value)} className="input-field" placeholder="NPR 2,500/month" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} className="input-field" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Active</label>
              <button type="button" onClick={() => set('active', !form.active)} className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${form.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 hover:bg-gray-50 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Program'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManagePrograms() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(programsCol, orderBy('order')), [])
  const { docs: programs, loading } = useCollection(q)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('programs', id, data)
      toast.success('Program updated!')
    } else {
      await addDocument(programsCol, form)
      toast.success('Program added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('programs', deleteId)
    toast.success('Program deleted.')
    setDeleteId(null)
  }

  const toggleActive = async (prog) => {
    await updateDocument('programs', prog.id, { active: !prog.active })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Programs</h1>
          <p className="text-gray-500 text-sm">{programs.length} total programs</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5">
          <MdAdd size={18} /> Add Program
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : programs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Program</th>
                  <th className="px-4 py-3 text-left font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left font-semibold">Age Group</th>
                  <th className="px-4 py-3 text-left font-semibold">Fee</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {programs.map(prog => (
                  <tr key={prog.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{prog.emoji || '⚽'}</span>
                        <span className="font-semibold text-navy">{prog.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${prog.sport === 'Football' ? 'bg-navy/10 text-navy' : prog.sport === 'Futsal' ? 'bg-green/10 text-green' : 'bg-gold/10 text-[#c47d00]'}`}>
                        {prog.sport}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{prog.ageGroup || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.fee || '-'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(prog)} className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${prog.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(prog)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(prog.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdSportsScore size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No programs yet. Add your first program.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && <Modal item={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Program?</h3>
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
