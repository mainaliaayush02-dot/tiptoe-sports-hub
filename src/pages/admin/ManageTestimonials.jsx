import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdStar } from 'react-icons/md'
import { FaStar } from 'react-icons/fa'
import { query, orderBy } from 'firebase/firestore'
import { testimonialsCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const EMPTY = { name: '', role: '', text: '', rating: 5, photoURL: '', visible: true }

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name || !form.text) { toast.error('Name and testimonial text are required.'); return }
    setSaving(true)
    try {
      await onSave({ ...form })
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
            <div className="flex items-center gap-4 mb-1">
              {form.photoURL
                ? <img src={form.photoURL} alt="Preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-gold/30" onError={e => e.target.style.display='none'} />
                : <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold">{form.name?.[0] || '?'}</div>
              }
              <input
                value={form.photoURL}
                onChange={e => set('photoURL', e.target.value)}
                className="input-field flex-1 text-sm"
                placeholder="Paste photo URL (optional)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <input value={form.role} onChange={e => set('role', e.target.value)} className="input-field" placeholder="Parent, Student (Age 14), etc." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Testimonial *</label>
            <textarea value={form.text} onChange={e => set('text', e.target.value)} rows={4} className="input-field resize-none" placeholder="Their testimonial..." />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => set('rating', n)}>
                  <FaStar className={`text-2xl transition-colors ${n <= form.rating ? 'text-gold' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Visible on website</label>
            <button type="button" onClick={() => set('visible', !form.visible)} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${form.visible ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageTestimonials() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(testimonialsCol, orderBy('createdAt', 'desc')), [])
  const { docs: testimonials, loading } = useCollection(q)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('testimonials', id, data)
      toast.success('Testimonial updated!')
    } else {
      await addDocument(testimonialsCol, form)
      toast.success('Testimonial added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('testimonials', deleteId)
    toast.success('Testimonial deleted.')
    setDeleteId(null)
  }

  const toggleVisible = async (t) => {
    await updateDocument('testimonials', t.id, { visible: !t.visible })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Testimonials</h1>
          <p className="text-gray-500 text-sm">{testimonials.length} testimonials</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5"><MdAdd size={18} /> Add Testimonial</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : testimonials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Person</th>
                  <th className="px-4 py-3 text-left font-semibold">Testimonial</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold">Visible</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testimonials.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {t.photoURL
                          ? <img src={t.photoURL} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                          : <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center text-gold text-sm font-bold">{t.name?.[0]}</div>
                        }
                        <div>
                          <div className="font-semibold text-navy">{t.name}</div>
                          <div className="text-xs text-gray-400">{t.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs">
                      <p className="line-clamp-2 text-xs">{t.text}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => <FaStar key={i} className="text-gold text-xs" />)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleVisible(t)} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${t.visible ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModal(t)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdStar size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No testimonials yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && <Modal item={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Testimonial?</h3>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
