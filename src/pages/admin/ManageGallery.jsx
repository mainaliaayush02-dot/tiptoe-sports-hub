import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdDelete, MdPhotoLibrary, MdLink } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { galleryCol } from '../../firebase/collections'
import { useCollection, addDocument, deleteDocument } from '../../hooks/useFirestore'

const CATEGORIES = ['Training', 'Events', 'Tournaments', 'International']

export default function ManageGallery() {
  const [newUrl, setNewUrl] = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [selectedCat, setSelectedCat] = useState('Training')
  const [adding, setAdding] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [filterCat, setFilterCat] = useState('All')

  const q = useMemo(() => query(galleryCol, orderBy('createdAt', 'desc')), [])
  const { docs: images, loading } = useCollection(q)

  const filtered = filterCat === 'All' ? images : images.filter(img => img.category === filterCat)

  const handleAdd = async () => {
    if (!newUrl.trim()) { toast.error('Please paste an image URL.'); return }
    setAdding(true)
    try {
      await addDocument(galleryCol, { url: newUrl.trim(), category: selectedCat, caption: newCaption.trim(), alt: newAlt.trim(), order: Date.now(), createdAt: Date.now() })
      setNewUrl('')
      setNewCaption('')
      setNewAlt('')
      toast.success('Image added!')
    } catch { toast.error('Failed to add image.') }
    finally { setAdding(false) }
  }

  const handleDelete = async () => {
    await deleteDocument('gallery', deleteId)
    toast.success('Image deleted.')
    setDeleteId(null)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-black text-2xl text-navy">Gallery</h1>
          <p className="text-gray-500 text-sm">{images.length} images</p>
        </div>
      </div>

      {/* Add by URL */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="font-bold text-navy mb-1">Add Image by URL</h2>
        <p className="text-xs text-gray-400 mb-4">
          Upload your photo to <strong>imgur.com</strong> (free, no account needed) â†’ right-click the image â†’ Copy image address â†’ paste below.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="input-field flex-1"
            placeholder="https://i.imgur.com/example.jpg"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="input-field sm:w-40">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex gap-3 mt-3">
          <input
            value={newCaption}
            onChange={e => setNewCaption(e.target.value)}
            className="input-field flex-1"
            placeholder="Caption (optional — shown on hover)"
          />
          <button onClick={handleAdd} disabled={adding} className="btn-primary text-sm py-2.5 disabled:opacity-60 whitespace-nowrap">
            <MdAdd size={18} /> {adding ? 'Adding...' : 'Add Image'}
          </button>
        </div>
        <input
          value={newAlt}
          onChange={e => setNewAlt(e.target.value)}
          className="input-field w-full mt-3"
          placeholder="SEO Alt Text — describe the photo for search engines (e.g. Tiptoe Academy football training Kathmandu Nepal)"
        />

        {/* Preview */}
        {newUrl && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-1">Preview:</p>
            <img src={newUrl} alt="Preview" className="h-24 rounded-xl object-cover" onError={e => { e.target.style.display='none' }} />
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filterCat === c ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>{c}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((img, i) => (
            <motion.div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <img src={img.url} alt={img.caption || img.category} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <span className="text-white text-xs font-semibold bg-navy/50 px-2 py-0.5 rounded-full">{img.category}</span>
                <button onClick={() => setDeleteId(img.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                  <MdDelete size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-400 bg-white rounded-2xl">
          <MdPhotoLibrary size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No images yet.</p>
          <p className="text-sm mt-1">Paste an image URL above to add photos.</p>
        </div>
      )}

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Image?</h3>
              <p className="text-gray-500 text-sm mb-5">The image record will be removed. This cannot be undone.</p>
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
