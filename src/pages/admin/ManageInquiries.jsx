import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdInbox, MdClose, MdDownload, MdPhone, MdEmail } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { inquiriesCol } from '../../firebase/collections'
import { useCollection, updateDocument } from '../../hooks/useFirestore'

const STATUSES = ['all', 'new', 'contacted', 'enrolled', 'rejected']
const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  enrolled: 'bg-green/10 text-green',
  rejected: 'bg-red-100 text-red-600',
}

function formatDate(ts) {
  if (!ts) return 'â€”'
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })
}

function exportCSV(inquiries) {
  const headers = ['Name', 'Age', 'Parent Name', 'Phone', 'Email', 'Sport', 'Age Group', 'Schedule', 'Status', 'Date', 'Message']
  const rows = inquiries.map(i => [
    i.name || '', i.age || '', i.parentName || '', i.phone || '', i.email || '',
    i.sport || '', i.ageGroup || '', i.preferredSchedule || '',
    i.status || 'new',
    formatDate(i.createdAt),
    (i.message || '').replace(/,/g, ';'),
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function DetailModal({ inquiry, onClose, onStatusChange }) {
  const [status, setStatus] = useState(inquiry.status || 'new')
  const [saving, setSaving] = useState(false)

  const handleStatus = async (newStatus) => {
    setSaving(true)
    try {
      await updateDocument('inquiries', inquiry.id, { status: newStatus })
      setStatus(newStatus)
      onStatusChange(inquiry.id, newStatus)
      toast.success(`Status updated to "${newStatus}".`)
    } catch { toast.error('Failed to update status.') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-navy text-lg">Inquiry Details</h2>
          <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Student */}
          <div className="bg-light rounded-xl p-4">
            <h3 className="font-bold text-navy mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400 block text-xs">Student Name</span><span className="font-semibold">{inquiry.name}</span></div>
              <div><span className="text-gray-400 block text-xs">Age</span><span className="font-semibold">{inquiry.age || 'â€”'}</span></div>
              <div><span className="text-gray-400 block text-xs">Parent/Guardian</span><span className="font-semibold">{inquiry.parentName || 'â€”'}</span></div>
              <div><span className="text-gray-400 block text-xs">Date</span><span className="font-semibold">{formatDate(inquiry.createdAt)}</span></div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            {inquiry.phone && (
              <a href={`tel:${inquiry.phone}`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <MdPhone className="text-navy" size={20} />
                <span className="text-sm font-semibold">{inquiry.phone}</span>
              </a>
            )}
            {inquiry.email && (
              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                <MdEmail className="text-navy" size={20} />
                <span className="text-sm font-semibold">{inquiry.email}</span>
              </a>
            )}
          </div>

          {/* Program */}
          <div className="bg-light rounded-xl p-4">
            <h3 className="font-bold text-navy mb-3">Program Interest</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400 block text-xs">Sport</span><span className="font-semibold">{inquiry.sport || 'â€”'}</span></div>
              <div><span className="text-gray-400 block text-xs">Age Group</span><span className="font-semibold">{inquiry.ageGroup || 'â€”'}</span></div>
              <div className="col-span-2"><span className="text-gray-400 block text-xs">Preferred Schedule</span><span className="font-semibold">{inquiry.preferredSchedule || 'â€”'}</span></div>
            </div>
          </div>

          {/* Message */}
          {inquiry.message && (
            <div>
              <h3 className="font-bold text-navy mb-2">Message</h3>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4 leading-relaxed">{inquiry.message}</p>
            </div>
          )}

          {/* Status */}
          <div>
            <h3 className="font-bold text-navy mb-3">Update Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {['new', 'contacted', 'enrolled', 'rejected'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatus(s)}
                  disabled={saving}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold capitalize transition-all border-2 disabled:opacity-60 ${
                    status === s
                      ? 'border-navy bg-navy text-white'
                      : 'border-gray-200 text-gray-600 hover:border-navy hover:text-navy'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ManageInquiries() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const q = useMemo(() => query(inquiriesCol, orderBy('createdAt', 'desc')), [])
  const { docs: inquiries, loading } = useCollection(q)

  const filtered = filter === 'all' ? inquiries : inquiries.filter(i => (i.status || 'new') === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? inquiries.length : inquiries.filter(i => (i.status || 'new') === s).length
    return acc
  }, {})

  const handleStatusChange = (id, newStatus) => {
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Inquiries</h1>
          <p className="text-gray-500 text-sm">{inquiries.length} total</p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MdDownload size={18} /> Export CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
              filter === s ? 'bg-navy text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {s}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Student</th>
                  <th className="px-4 py-3 text-left font-semibold">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold">Sport</th>
                  <th className="px-4 py-3 text-left font-semibold">Age Group</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(inq => (
                  <tr
                    key={inq.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelected(inq)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{inq.name}</div>
                      {inq.parentName && <div className="text-xs text-gray-400">Parent: {inq.parentName}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{inq.phone || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-600">{inq.sport || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-600">{inq.ageGroup || 'â€”'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(inq.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[inq.status || 'new'] || 'bg-gray-100 text-gray-600'}`}>
                        {inq.status || 'new'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdInbox size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No {filter === 'all' ? '' : filter} inquiries.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            inquiry={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
