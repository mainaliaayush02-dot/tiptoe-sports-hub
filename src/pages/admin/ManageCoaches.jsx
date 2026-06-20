import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdPeople } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { coachesCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const EMPTY = { name: '', role: '', bio: '', experience: '', achievements: '', photoURL: '', order: 99, active: true, featured: false }

function normalizePhotoUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.hostname === 'imgur.com') {
      // imgur.com/a/XXXX or imgur.com/gallery/XXXX → i.imgur.com/XXXX.jpg
      const album = u.pathname.match(/^\/(?:a|gallery)\/([a-zA-Z0-9]+)/)
      if (album) return `https://i.imgur.com/${album[1]}.jpg`
      // imgur.com/XXXX (page view, no extension) → i.imgur.com/XXXX.jpg
      const page = u.pathname.match(/^\/([a-zA-Z0-9]+)$/)
      if (page) return `https://i.imgur.com/${page[1]}.jpg`
    }
  } catch {}
  return url
}

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item ? { ...item, achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : (item.achievements || '') } : EMPTY
  )
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required.'); return }
    setSaving(true)
    try {
      const data = {
        ...form,
        photoURL: normalizePhotoUrl(form.photoURL),
        achievements: form.achievements.split('\n').filter(a => a.trim()),
      }
      await onSave(data)
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Coach' : 'Add Coach'}</h2>
          <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Photo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
            <div className="flex items-center gap-4 mb-2">
              <div className="relative w-16 h-16 rounded-full shrink-0 bg-gray-100 flex items-center justify-center text-gray-300 overflow-hidden">
                <MdPeople size={28} />
                {form.photoURL && (
                  <img
                    src={normalizePhotoUrl(form.photoURL)}
                    alt="Preview"
                    className="absolute inset-0 w-16 h-16 rounded-full object-cover ring-2 ring-gold/30"
                    onError={e => e.target.style.display = 'none'}
                  />
                )}
              </div>
              <div className="flex-1">
                <input
                  value={form.photoURL}
                  onChange={e => set('photoURL', e.target.value)}
                  className="input-field text-sm"
                  placeholder="https://i.imgur.com/XXXXX.jpg"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Upload to <strong>imgur.com</strong>, then right-click the image and choose <strong>Copy image address</strong> to get a direct URL like <code className="bg-gray-100 px-1 rounded">https://i.imgur.com/XXXXX.jpg</code>. Album and page links are converted automatically.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
              <input value={form.role} onChange={e => set('role', e.target.value)} className="input-field" placeholder="Head Coach" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Experience</label>
              <input value={form.experience} onChange={e => set('experience', e.target.value)} className="input-field" placeholder="10+ Years" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Achievements (one per line)</label>
              <textarea value={form.achievements} onChange={e => set('achievements', e.target.value)} rows={4} className="input-field resize-none font-mono text-sm" placeholder="Nepal National Coach&#10;Former Club Coach" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Lower = higher on page. Add new coaches at 10, 20… to keep Gaurav (1) & Hari (2) on top.</p>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">Active</label>
                <button type="button" onClick={() => set('active', !form.active)} className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${form.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-gray-700">⭐ Featured</label>
                <button type="button" onClick={() => set('featured', !form.featured)} className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${form.featured ? 'bg-gold justify-end' : 'bg-gray-300 justify-start'}`}>
                  <div className="w-5 h-5 bg-white rounded-full shadow" />
                </button>
              </div>
              <p className="col-span-2 text-xs text-gray-400 -mt-2">Featured coaches appear at the top of the Coaches page in the large full-width layout.</p>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Coach'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageCoaches() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(coachesCol, orderBy('order')), [])
  const { docs: coaches, loading } = useCollection(q)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('coaches', id, data)
      toast.success('Coach updated!')
    } else {
      await addDocument(coachesCol, form)
      toast.success('Coach added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('coaches', deleteId)
    toast.success('Coach deleted.')
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Coaches</h1>
          <p className="text-gray-500 text-sm">{coaches.length} coaches</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5"><MdAdd size={18} /> Add Coach</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : coaches.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Coach</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Experience</th>
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Featured</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coaches.map(coach => (
                  <tr key={coach.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full shrink-0 bg-navy flex items-center justify-center text-gold font-bold text-sm overflow-hidden">
                          {coach.name?.[0]}
                          {coach.photoURL && (
                            <img src={coach.photoURL} alt={coach.name} className="absolute inset-0 w-10 h-10 object-cover" onError={e => e.target.style.display = 'none'} />
                          )}
                        </div>
                        <span className="font-semibold text-navy">{coach.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{coach.role}</td>
                    <td className="px-4 py-3 text-gray-600">{coach.experience}</td>
                    <td className="px-4 py-3 text-gray-400">{coach.order}</td>
                    <td className="px-4 py-3">
                      {coach.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-gold">⭐ Featured</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModal(coach)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(coach.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdPeople size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No coaches yet. Add your first coach.</p>
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
              <h3 className="font-bold text-lg text-navy mb-2">Delete Coach?</h3>
              <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
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
