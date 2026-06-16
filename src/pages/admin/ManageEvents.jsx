import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdEventNote } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { eventsCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const EMPTY = { title: '', date: '', venue: '', description: '', bannerURL: '', isUpcoming: true, registrationLink: '' }

function EventModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.title) { toast.error('Title is required.'); return }
    setSaving(true)
    try {
      await onSave({ ...form })
      onClose()
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Event' : 'Add Event'}</h2>
          <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Banner URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Banner Image</label>
            {form.bannerURL && (
              <img src={form.bannerURL} alt="Banner preview" className="w-full h-36 object-cover rounded-xl mb-2" onError={e => e.target.style.display='none'} />
            )}
            <input
              value={form.bannerURL}
              onChange={e => set('bannerURL', e.target.value)}
              className="input-field text-sm"
              placeholder="Paste image URL (e.g. from imgur.com)"
            />
            <p className="text-xs text-gray-400 mt-1">Upload to <strong>imgur.com</strong> free, then paste the link.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event Title *</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
              <input value={form.date} onChange={e => set('date', e.target.value)} className="input-field" placeholder="Dec 15, 2025" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
              <input value={form.venue} onChange={e => set('venue', e.target.value)} className="input-field" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="input-field resize-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Link</label>
              <input value={form.registrationLink} onChange={e => set('registrationLink', e.target.value)} className="input-field" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Upcoming</label>
              <button type="button" onClick={() => set('isUpcoming', !form.isUpcoming)} className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${form.isUpcoming ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                <div className="w-5 h-5 bg-white rounded-full shadow" />
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageEvents() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(eventsCol, orderBy('createdAt', 'desc')), [])
  const { docs: events, loading } = useCollection(q)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('events', id, data)
      toast.success('Event updated!')
    } else {
      await addDocument(eventsCol, form)
      toast.success('Event added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('events', deleteId)
    toast.success('Event deleted.')
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Events</h1>
          <p className="text-gray-500 text-sm">{events.length} events</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5"><MdAdd size={18} /> Add Event</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : events.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Event</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Venue</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {ev.bannerURL && <img src={ev.bannerURL} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <span className="font-semibold text-navy line-clamp-1">{ev.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ev.date || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-600">{ev.venue || 'â€”'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ev.isUpcoming ? 'bg-green/10 text-green' : 'bg-gray-100 text-gray-500'}`}>
                        {ev.isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setModal(ev)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(ev.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdEventNote size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No events yet. Add your first event.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {modal !== null && <EventModal item={modal.id ? modal : null} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Event?</h3>
              <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
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
