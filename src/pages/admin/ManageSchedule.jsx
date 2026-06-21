import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdSchedule } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { scheduleCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SPORTS = ['Football', 'Futsal']
const AGE_GROUPS = ['Age 4–10', 'Age 11–15', 'Age 16–18', 'All Ages', 'Girls']
const EMPTY = { day: 'Monday', startTime: '15:00', endTime: '17:00', sport: 'Football', ageGroup: 'All Ages', venue: '', coachName: '' }

function fmt(t) {
  if (!t) return ''
  const [h, m] = t.split(':')
  const hr = parseInt(h)
  return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`
}

function SlotModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.day || !form.startTime) { toast.error('Day and time are required.'); return }
    setSaving(true)
    try { await onSave(form); onClose() }
    catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Slot' : 'Add Slot'}</h2>
          <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Day *</label>
              <select value={form.day} onChange={e => set('day', e.target.value)} className="input-field">
                {DAYS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sport</label>
              <select value={form.sport} onChange={e => set('sport', e.target.value)} className="input-field">
                {SPORTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time *</label>
              <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Age Group</label>
              <select value={form.ageGroup} onChange={e => set('ageGroup', e.target.value)} className="input-field">
                {AGE_GROUPS.map(ag => <option key={ag}>{ag}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
              <input value={form.venue} onChange={e => set('venue', e.target.value)} className="input-field" placeholder="Ground name" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Coach Name</label>
              <input value={form.coachName} onChange={e => set('coachName', e.target.value)} className="input-field" placeholder="Assigned coach" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Slot'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageSchedule() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const q = useMemo(() => query(scheduleCol, orderBy('day')), [])
  const { docs: schedule, loading } = useCollection(q)

  const byDay = DAYS.reduce((acc, d) => { acc[d] = schedule.filter(s => s.day === d); return acc }, {})

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('schedule', id, data)
      toast.success('Slot updated!')
    } else {
      await addDocument(scheduleCol, form)
      toast.success('Slot added!')
    }
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Schedule</h1>
          <p className="text-gray-500 text-sm">{schedule.length} training slots</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5"><MdAdd size={18} /> Add Slot</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-navy text-white px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold">{day}</h3>
                <button onClick={() => setModal({ day })} className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors">
                  <MdAdd size={16} />
                </button>
              </div>
              <div className="p-3 space-y-2 min-h-[80px]">
                {byDay[day].length > 0 ? byDay[day].map(slot => (
                  <div key={slot.id} className="p-3 bg-gray-50 rounded-xl flex items-start justify-between gap-2">
                    <div>
                      <div className="flex gap-2 items-center mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${slot.sport === 'Football' ? 'bg-navy text-white' : 'bg-green text-white'}`}>{slot.sport}</span>
                        <span className="text-xs text-gold font-semibold">{fmt(slot.startTime)}</span>
                      </div>
                      <div className="text-xs text-navy font-semibold">{slot.ageGroup}</div>
                      {slot.venue && <div className="text-xs text-gray-400">{slot.venue}</div>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setModal(slot)} className="p-1 text-gray-400 hover:text-navy rounded transition-colors"><MdEdit size={14} /></button>
                      <button onClick={() => setDeleteId(slot.id)} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"><MdDelete size={14} /></button>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-gray-300 text-xs py-4">No sessions</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal !== null && <SlotModal item={modal.id ? modal : (modal.day ? { ...EMPTY, day: modal.day } : null)} onClose={() => setModal(null)} onSave={handleSave} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Slot?</h3>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
                <button onClick={async () => { await deleteDocument('schedule', deleteId); toast.success('Slot deleted.'); setDeleteId(null) }} className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
