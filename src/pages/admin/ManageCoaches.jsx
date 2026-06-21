import { useState, useMemo, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdPeople, MdCloudUpload, MdCrop, MdLink } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { coachesCol } from '../../firebase/collections'
import { useCollection, addDocument, updateDocument, deleteDocument } from '../../hooks/useFirestore'

const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const canUpload    = !!(CLOUD_NAME && CLOUD_PRESET)

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
  const size = Math.min(pixelCrop.width, pixelCrop.height, 1200)
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
  fd.append('folder', 'coaches')
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

async function uploadUrlToCloudinary(imageUrl) {
  const fd = new FormData()
  fd.append('file', imageUrl)
  fd.append('upload_preset', CLOUD_PRESET)
  fd.append('folder', 'coaches')
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: fd,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || `Upload failed (${res.status})`)
  return json.secure_url
}

const EMPTY = { name: '', role: '', bio: '', experience: '', achievements: '', photoURL: '', order: 99, active: true, featured: false }

function normalizePhotoUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    if (u.hostname === 'imgur.com') {
      const album = u.pathname.match(/^\/(?:a|gallery)\/([a-zA-Z0-9]+)/)
      if (album) return `https://i.imgur.com/${album[1]}.jpg`
      const page = u.pathname.match(/^\/([a-zA-Z0-9]+)$/)
      if (page) return `https://i.imgur.com/${page[1]}.jpg`
    }
  } catch {}
  return url
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
          <span className="text-white/40 text-xs ml-1">Square crop fits all coach cards</span>
        </div>
        <button onClick={onCancel} className="text-white/50 hover:text-white transition-colors">
          <MdClose size={22} />
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
            cropAreaStyle: { border: '2px solid #E8B923', borderRadius: '12px' },
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

function Modal({ item, onClose, onSave }) {
  const [form, setForm] = useState(
    item ? { ...item, achievements: Array.isArray(item.achievements) ? item.achievements.join('\n') : (item.achievements || '') } : EMPTY
  )
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [cropSrc, setCropSrc]     = useState(null)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)

  const handleImportUrl = async () => {
    const url = importUrl.trim()
    if (!url) { toast.error('Paste an image URL first.'); return }
    setImporting(true)
    try {
      const cloudUrl = await uploadUrlToCloudinary(url)
      set('photoURL', cloudUrl)
      setImportUrl('')
      toast.success('Photo imported to Cloudinary!')
    } catch (err) {
      toast.error(err.message || 'Import failed — make sure the URL is a direct image link.')
    } finally {
      setImporting(false)
    }
  }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
      set('photoURL', url)
      setCropSrc(null)
      toast.success('Photo uploaded!')
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

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

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Coach' : 'Add Coach'}</h2>
            <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
          </div>
          <div className="p-6 space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Coach Photo</label>
              <div className="flex items-center gap-4 mb-3">
                {/* Preview */}
                <div className="relative w-20 h-20 rounded-full shrink-0 bg-gray-100 flex items-center justify-center text-gray-300 overflow-hidden ring-2 ring-gray-200">
                  <MdPeople size={32} />
                  {form.photoURL && (
                    <img
                      src={normalizePhotoUrl(form.photoURL)}
                      alt="Preview"
                      className="absolute inset-0 w-20 h-20 object-cover rounded-full"
                      onError={e => e.target.style.display = 'none'}
                    />
                  )}
                </div>

                {/* Upload button */}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {canUpload ? (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading || saving}
                      className="w-full btn-primary text-sm py-3 justify-center gap-2 disabled:opacity-60"
                    >
                      <MdCrop size={18} />
                      {uploading ? `Uploading... ${uploadPct}%` : 'Upload & Crop Photo'}
                    </button>
                  ) : (
                    <div className="w-full text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3 leading-relaxed">
                      <strong>Setup needed:</strong> Add <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to your <code>.env.local</code> and Vercel settings.
                    </div>
                  )}
                  {uploading && (
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green transition-all duration-200" style={{ width: `${uploadPct}%` }} />
                    </div>
                  )}
                </div>
              </div>

              {/* URL fallback */}
              <div className="flex gap-2">
                <input
                  value={form.photoURL}
                  onChange={e => set('photoURL', e.target.value)}
                  onBlur={e => set('photoURL', normalizePhotoUrl(e.target.value))}
                  className="input-field text-xs flex-1"
                  placeholder="Or paste a direct image URL"
                />
                {form.photoURL && (
                  <button
                    type="button"
                    onClick={() => set('photoURL', '')}
                    className="px-3 text-xs text-red-400 hover:text-red-600 border border-gray-200 rounded-xl"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Import from URL (Facebook, etc.) */}
              {canUpload && (
                <div className="border border-dashed border-gray-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <MdLink size={13} /> Import photo from URL (Facebook, WhatsApp, Google Photos…)
                  </p>
                  <div className="flex gap-2">
                    <input
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      className="input-field text-xs flex-1"
                      placeholder="Paste direct image URL…"
                      onKeyDown={e => e.key === 'Enter' && handleImportUrl()}
                    />
                    <button
                      type="button"
                      onClick={handleImportUrl}
                      disabled={importing || !importUrl.trim()}
                      className="btn-primary text-xs py-2 whitespace-nowrap disabled:opacity-60"
                    >
                      {importing ? 'Importing…' : 'Import'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    <strong>Facebook:</strong> Right-click the photo → <em>"Copy image address"</em> → paste here. Don't use the facebook.com/photo page link.
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400">Upload from device (with crop), paste a URL, or import from Facebook/social media above.</p>
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
                <p className="text-xs text-gray-400 mt-1">Lower = higher on page. Keep Gaurav at 1, Hari at 2.</p>
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
    </>
  )
}

export default function ManageCoaches() {
  const [modal, setModal]       = useState(null)
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
