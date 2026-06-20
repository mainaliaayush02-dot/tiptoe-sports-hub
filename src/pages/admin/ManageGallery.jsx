import { useState, useMemo, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdDelete, MdPhotoLibrary, MdCrop, MdCloudUpload } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { galleryCol } from '../../firebase/collections'
import { useCollection, addDocument, deleteDocument } from '../../hooks/useFirestore'

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const canUpload    = !!(CLOUD_NAME && CLOUD_PRESET)

const CATEGORIES = ['Training', 'Events', 'Tournaments', 'International']

function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc)
  const size = Math.min(pixelCrop.width, pixelCrop.height, 1400)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  canvas.getContext('2d').drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, size, size
  )
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

async function uploadToCloudinary(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUD_PRESET)
  fd.append('folder', 'gallery')
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url)
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err?.error?.message || `Upload failed (${xhr.status})`))
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`))
        }
      }
    }
    xhr.onerror = () => reject(new Error('Network error — check your connection'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(fd)
  })
}

function CropModal({ src, onConfirm, onCancel, uploading, uploadPct }) {
  const [crop, setCrop]  = useState({ x: 0, y: 0 })
  const [zoom, setZoom]  = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    const blob = await getCroppedImg(src, croppedAreaPixels)
    onConfirm(blob)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <MdCrop size={20} className="text-gold" />
          <span className="font-bold text-sm">Crop Photo</span>
          <span className="text-white/40 text-xs ml-1">Square crop fits the gallery grid</span>
        </div>
        <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
          ✕
        </button>
      </div>

      {/* Cropper area */}
      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape="rect"
          showGrid={false}
          style={{
            containerStyle: { background: '#111' },
            cropAreaStyle: { border: '2px solid #E8B923', borderRadius: '8px' },
          }}
        />
      </div>

      {/* Controls */}
      <div className="shrink-0 bg-black/90 border-t border-white/10 px-4 py-4 space-y-4">
        {/* Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs w-10">Zoom</span>
          <input
            type="range"
            min={1} max={3} step={0.01}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-gold h-1 cursor-pointer"
          />
          <span className="text-white/40 text-xs w-10 text-right">{zoom.toFixed(1)}x</span>
        </div>

        {/* Upload progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/50">
              <span>Uploading to Cloudinary...</span>
              <span>{uploadPct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-200" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={uploading || !croppedAreaPixels}
            className="flex-[2] py-3 rounded-xl bg-gold text-navy text-sm font-bold hover:bg-gold/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <MdCloudUpload size={18} />
            {uploading ? `Uploading ${uploadPct}%` : 'Crop & Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ManageGallery() {
  const [newUrl, setNewUrl]         = useState('')
  const [newCaption, setNewCaption] = useState('')
  const [newAlt, setNewAlt]         = useState('')
  const [selectedCat, setSelectedCat] = useState('Training')
  const [adding, setAdding]         = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [uploadPct, setUploadPct]   = useState(0)
  const [cropSrc, setCropSrc]       = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [filterCat, setFilterCat]   = useState('All')
  const fileRef = useRef(null)

  const q = useMemo(() => query(galleryCol, orderBy('createdAt', 'desc')), [])
  const { docs: images, loading } = useCollection(q)

  const filtered = filterCat === 'All' ? images : images.filter(img => img.category === filterCat)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 20 * 1024 * 1024) { toast.error('Image must be under 20 MB'); return }
    const reader = new FileReader()
    reader.onload = () => setCropSrc(reader.result)
    reader.readAsDataURL(file)
  }

  const handleCropConfirm = async (blob) => {
    setUploading(true)
    setUploadPct(0)
    try {
      const url = await uploadToCloudinary(blob, setUploadPct)
      setNewUrl(url)
      setCropSrc(null)
      toast.success('Photo uploaded! Fill in the details and click Add Image.')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async () => {
    if (!newUrl.trim()) { toast.error('Please upload a photo or paste an image URL.'); return }
    setAdding(true)
    try {
      await addDocument(galleryCol, {
        url: newUrl.trim(),
        category: selectedCat,
        caption: newCaption.trim(),
        alt: newAlt.trim(),
        order: Date.now(),
        createdAt: Date.now(),
      })
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
    <>
      {cropSrc && (
        <CropModal
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => { setCropSrc(null); setUploading(false) }}
          uploading={uploading}
          uploadPct={uploadPct}
        />
      )}

      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black text-2xl text-navy">Gallery</h1>
            <p className="text-gray-500 text-sm">{images.length} images</p>
          </div>
        </div>

        {/* Add Image panel */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <div>
            <h2 className="font-bold text-navy mb-0.5">Add Photo</h2>
            <p className="text-xs text-gray-400">Upload from your device and crop it, or paste a direct image URL.</p>
          </div>

          {/* Upload button */}
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFileSelect} className="hidden" />
          <div className="flex flex-col sm:flex-row gap-3">
            {canUpload ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || adding}
                className="btn-primary text-sm py-3 justify-center gap-2 disabled:opacity-60 sm:flex-1"
              >
                <MdCrop size={18} />
                {uploading ? `Uploading... ${uploadPct}%` : 'Upload & Crop Photo'}
              </button>
            ) : (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 leading-relaxed">
                <strong>Setup needed:</strong> Add <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your <code>.env.local</code> and Vercel settings.
              </div>
            )}
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
              className="input-field sm:w-44"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Upload progress bar */}
          {uploading && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green transition-all duration-200" style={{ width: `${uploadPct}%` }} />
            </div>
          )}

          {/* URL field (auto-filled after upload, or paste manually) */}
          <div>
            <input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              className="input-field w-full"
              placeholder="Image URL (auto-filled after upload, or paste directly)"
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>

          {/* Caption + Add */}
          <div className="flex gap-3">
            <input
              value={newCaption}
              onChange={e => setNewCaption(e.target.value)}
              className="input-field flex-1"
              placeholder="Caption (optional — shown on hover)"
            />
            <button
              onClick={handleAdd}
              disabled={adding || uploading}
              className="btn-primary text-sm py-2.5 disabled:opacity-60 whitespace-nowrap"
            >
              <MdAdd size={18} /> {adding ? 'Adding...' : 'Add Image'}
            </button>
          </div>

          {/* SEO alt */}
          <input
            value={newAlt}
            onChange={e => setNewAlt(e.target.value)}
            className="input-field w-full"
            placeholder="SEO Alt Text — describe the photo (e.g. Tiptoe Academy football training Kathmandu Nepal)"
          />

          {/* Preview */}
          {newUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Preview:</p>
              <img
                src={newUrl}
                alt="Preview"
                className="h-24 rounded-xl object-cover"
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {['All', ...CATEGORIES].map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${filterCat === c ? 'bg-navy text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              {c}
            </button>
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
              <motion.div
                key={img.id}
                className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <img src={img.url} alt={img.alt || img.caption || img.category} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <span className="text-white text-xs font-semibold bg-navy/50 px-2 py-0.5 rounded-full">{img.category}</span>
                  {img.caption && <span className="text-white/80 text-xs text-center px-3 line-clamp-2">{img.caption}</span>}
                  <button
                    onClick={() => setDeleteId(img.id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
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
            <p className="text-sm mt-1">Upload a photo above to get started.</p>
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
    </>
  )
}
