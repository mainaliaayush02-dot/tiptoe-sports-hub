import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdQuestionAnswer } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { faqCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const CATEGORIES = ['General', 'Academy', 'Pricing', 'Sports Hub']
const EMPTY = { question: '', answer: '', category: 'General', order: 0, active: true }

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.question || !form.answer) { toast.error('Question and answer are required.'); return }
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
          <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit FAQ' : 'Add FAQ'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><MdClose size={22} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Order</label>
              <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Question *</label>
            <input value={form.question} onChange={e => set('question', e.target.value)} className="input-field" placeholder="e.g. What age groups do you accept?" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Answer *</label>
            <textarea value={form.answer} onChange={e => set('answer', e.target.value)} rows={5} className="input-field resize-none" placeholder="Write the full answer here..." />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Active (show on website)</label>
            <button type="button" onClick={() => set('active', !form.active)}
              className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${form.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary justify-center disabled:opacity-60">
              {saving ? 'Saving...' : 'Save FAQ'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const CAT_COLORS = {
  General: 'bg-navy/10 text-navy',
  Academy: 'bg-green/10 text-green',
  Pricing: 'bg-gold/20 text-[#c47d00]',
  'Sports Hub': 'bg-purple-100 text-purple-700',
}

export default function ManageFAQ() {
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filterCat, setFilterCat] = useState('All')
  const q = useMemo(() => query(faqCol, orderBy('order')), [])
  const { docs: faqs, loading } = useCollection(q)

  const filtered = filterCat === 'All' ? faqs : faqs.filter(f => f.category === filterCat)

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('faq', id, data)
      toast.success('FAQ updated!')
    } else {
      await addDocument(faqCol, form)
      toast.success('FAQ added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('faq', deleteId)
    toast.success('FAQ deleted.')
    setDeleteId(null)
  }

  const toggleActive = async (faq) => {
    await updateDocument('faq', faq.id, { active: !faq.active })
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">FAQ</h1>
          <p className="text-gray-500 text-sm">{faqs.length} questions — shown on the /faq page and used for Google rich results</p>
        </div>
        <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5">
          <MdAdd size={18} /> Add FAQ
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCat === c ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Question</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Answer (preview)</th>
                  <th className="px-4 py-3 text-left font-semibold">Active</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(faq => (
                  <tr key={faq.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="font-semibold text-navy line-clamp-2 text-xs">{faq.question}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${CAT_COLORS[faq.category] || 'bg-gray-100 text-gray-600'}`}>{faq.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[280px]">
                      <p className="line-clamp-2">{faq.answer}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(faq)}
                        className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-all ${faq.active ? 'bg-green justify-end' : 'bg-gray-300 justify-start'}`}>
                        <div className="w-5 h-5 bg-white rounded-full shadow" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setModal(faq)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                        <button onClick={() => setDeleteId(faq.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-gray-400">
            <MdQuestionAnswer size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No FAQs yet.</p>
            <p className="text-sm mt-1">Add questions to display them on the website and improve SEO.</p>
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
              <h3 className="font-bold text-lg text-navy mb-2">Delete FAQ?</h3>
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
