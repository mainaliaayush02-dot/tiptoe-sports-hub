import { useState, useMemo, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { MdAdd, MdEdit, MdDelete, MdClose, MdGroups, MdCloudUpload, MdCrop, MdLink, MdDownload } from 'react-icons/md'
import { query, orderBy } from 'firebase/firestore'
import { boardMembersCol } from '../../firebase/collections'
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
  fd.append('folder', 'board-members')
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) onProgress(Math.round(e.loaded / e.total * 100))
    }
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText).secure_url)
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText)?.error?.message || `Upload failed (${xhr.status})`)) }
        catch { reject(new Error(`Upload failed (${xhr.status})`)) }
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
  fd.append('folder', 'board-members')
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
  const json = await res.json()
  if (!res.ok) throw new Error(json?.error?.message || `Upload failed (${res.status})`)
  return json.secure_url
}

function CropModal({ src, onConfirm, onCancel, uploading, uploadPct }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const onCropComplete = useCallback((_, pixels) => setCroppedAreaPixels(pixels), [])

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return
    onConfirm(await getCroppedImg(src, croppedAreaPixels))
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <MdCrop size={20} className="text-gold" />
          <span className="font-bold text-sm">Crop Photo</span>
          <span className="text-white/40 text-xs ml-1">Square crop — best for board member cards</span>
        </div>
        <button onClick={onCancel} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { background: '#111' },
            cropAreaStyle: { border: '2px solid #E8B923', borderRadius: '8px' },
          }}
        />
      </div>
      <div className="shrink-0 bg-black/90 border-t border-white/10 px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-white/40 text-xs w-10">Zoom</span>
          <input type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-gold h-1 cursor-pointer" />
          <span className="text-white/40 text-xs w-10 text-right">{zoom.toFixed(1)}x</span>
        </div>
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/50">
              <span>Uploading...</span><span>{uploadPct}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gold transition-all duration-200" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={uploading}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 disabled:opacity-40">
            Cancel
          </button>
          <button type="button" onClick={handleConfirm} disabled={uploading || !croppedAreaPixels}
            className="flex-[2] py-3 rounded-xl bg-gold text-navy text-sm font-bold hover:bg-gold/90 disabled:opacity-40 flex items-center justify-center gap-2">
            <MdCloudUpload size={18} />
            {uploading ? `Uploading ${uploadPct}%` : 'Crop & Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

const EMPTY = { name: '', title: '', bio: '', photoURL: '', order: 99, active: true }

function MemberModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item || EMPTY)
  const [saving, setSaving]       = useState(false)
  const [cropSrc, setCropSrc]     = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadPct, setUploadPct] = useState(0)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const fileRef = useRef(null)
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

  const handleSave = async () => {
    if (!form.name) { toast.error('Name is required.'); return }
    setSaving(true)
    try { await onSave(form); onClose() }
    catch { toast.error('Failed to save.') }
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

      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-navy text-lg">{item?.id ? 'Edit Member' : 'Add Board Member'}</h2>
            <button onClick={onClose}><MdClose size={22} className="text-gray-400" /></button>
          </div>

          <div className="p-6 space-y-4">
            {/* Photo section */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Photo</label>

              {/* Preview */}
              {form.photoURL && (
                <div className="flex items-center gap-3">
                  <img src={form.photoURL} alt="Preview"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-gold/20"
                    onError={e => e.target.style.display = 'none'} />
                  <button type="button" onClick={() => set('photoURL', '')}
                    className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
              )}

              {/* Upload from device */}
              <input type="file" accept="image/*" ref={fileRef} onChange={handleFileSelect} className="hidden" />
              {canUpload ? (
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={uploading || importing}
                  className="w-full btn-primary text-sm py-2.5 justify-center disabled:opacity-60">
                  <MdCrop size={16} />
                  {uploading ? `Uploading… ${uploadPct}%` : 'Upload & Crop Photo'}
                </button>
              ) : (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Configure Cloudinary env vars to enable photo upload.
                </p>
              )}

              {uploading && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green transition-all" style={{ width: `${uploadPct}%` }} />
                </div>
              )}

              {/* Import from URL */}
              {canUpload && (
                <div className="border border-dashed border-gray-200 rounded-xl p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                    <MdLink size={13} /> Import from URL (Facebook, Google Photos…)
                  </p>
                  <div className="flex gap-2">
                    <input value={importUrl} onChange={e => setImportUrl(e.target.value)}
                      className="input-field text-xs flex-1" placeholder="Paste direct image URL…"
                      onKeyDown={e => e.key === 'Enter' && handleImportUrl()} />
                    <button type="button" onClick={handleImportUrl}
                      disabled={importing || !importUrl.trim()}
                      className="btn-primary text-xs py-2 whitespace-nowrap disabled:opacity-60">
                      {importing ? 'Importing…' : 'Import'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    <strong>Facebook:</strong> Right-click the photo → <em>"Copy image address"</em> → paste here.
                  </p>
                </div>
              )}

              {/* Manual URL */}
              <input value={form.photoURL} onChange={e => set('photoURL', e.target.value)}
                className="input-field text-xs" placeholder="Or paste a direct image URL" />
            </div>

            {/* Name & Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" placeholder="e.g. Gaurav Basnet" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title / Role</label>
              <input value={form.title} onChange={e => set('title', e.target.value)} className="input-field" placeholder="e.g. President & Co-Founder" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Bio (2–3 sentences)</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                className="input-field resize-none" placeholder="Short biography displayed on the homepage..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={e => set('order', Number(e.target.value))}
                  className="input-field" />
              </div>
              <div className="flex items-end gap-3 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => set('active', !form.active)}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.active ? 'bg-green' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.active ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{form.active ? 'Active' : 'Hidden'}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 btn-primary justify-center disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Member'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}

const SEED_MEMBERS = [
  { name: 'Gaurav Basnet',  title: 'President & Co-Founder',         bio: "Co-founder of Tiptoe Sports Hub. Nepal National Futsal Head Coach for three consecutive terms and one of Nepal's most respected football minds.", photoURL: '', order: 1, active: true },
  { name: 'Hari Khadka',    title: 'Brand Ambassador',               bio: "Nepal's all-time highest international goal scorer and former captain of the Nepal National Football Team. Technical advisor to the Hub.", photoURL: '', order: 2, active: true },
  { name: 'Board Member',   title: 'Director – Operations',          bio: 'Oversees day-to-day operations, facilities management, and staff development across all six sports verticals at Tiptoe Sports Hub.', photoURL: '', order: 3, active: true },
  { name: 'Board Member',   title: 'Director – Finance',             bio: 'Responsible for financial planning, budgeting, and sustainable growth strategy for Tiptoe Sports Hub in Tarkeshwar, Kathmandu.', photoURL: '', order: 4, active: true },
  { name: 'Board Member',   title: 'Director – Community Relations', bio: 'Drives community engagement, partnerships, and outreach programmes that connect the Hub with schools, clubs, and sports organisations across Kathmandu.', photoURL: '', order: 5, active: true },
]

export default function ManageBoardMembers() {
  const [modal, setModal]     = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [seeding, setSeeding]   = useState(false)
  const q = useMemo(() => query(boardMembersCol, orderBy('order')), [])
  const { docs: members, loading } = useCollection(q)

  const handleSeedDefaults = async () => {
    setSeeding(true)
    try {
      await Promise.all(SEED_MEMBERS.map(m => addDocument(boardMembersCol, m)))
      toast.success('5 default board members imported!')
    } catch { toast.error('Failed to import defaults.') }
    finally { setSeeding(false) }
  }

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('boardMembers', id, data)
      toast.success('Member updated!')
    } else {
      await addDocument(boardMembersCol, form)
      toast.success('Member added!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('boardMembers', deleteId)
    toast.success('Member removed.')
    setDeleteId(null)
  }

  const toggleActive = async (member) => {
    await updateDocument('boardMembers', member.id, { active: !member.active })
    toast.success(member.active ? 'Hidden from homepage.' : 'Now visible on homepage.')
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black text-2xl text-navy">Board of Directors</h1>
            <p className="text-gray-500 text-sm">{members.filter(m => m.active !== false).length} active · {members.length} total</p>
          </div>
          <button onClick={() => setModal({})} className="btn-primary text-sm py-2.5">
            <MdAdd size={18} /> Add Member
          </button>
        </div>

        {/* Seed banner — shown when Firestore is empty */}
        {!loading && members.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <MdDownload size={24} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800 text-sm">No board members yet</p>
              <p className="text-blue-600 text-xs mt-1">Import 5 default members to get started. You can edit names, photos and bios after importing.</p>
            </div>
            <button onClick={handleSeedDefaults} disabled={seeding}
              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
              {seeding ? 'Importing...' : 'Import 5 Defaults'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Member</th>
                    <th className="px-4 py-3 text-left font-semibold">Title</th>
                    <th className="px-4 py-3 text-left font-semibold">Order</th>
                    <th className="px-4 py-3 text-left font-semibold">Visible</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {members.map(member => {
                    const initials = (member.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                    return (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {member.photoURL
                              ? <img src={member.photoURL} alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                                  onError={e => e.target.style.display = 'none'} />
                              : <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center text-gold font-bold text-sm">{initials}</div>
                            }
                            <div className="font-semibold text-navy">{member.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{member.title}</td>
                        <td className="px-4 py-3 text-gray-400">{member.order}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleActive(member)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${member.active !== false ? 'bg-green/10 text-green hover:bg-green/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            {member.active !== false ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setModal(member)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors">
                              <MdEdit size={16} />
                            </button>
                            <button onClick={() => setDeleteId(member.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <MdDelete size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <MdGroups size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No board members yet.</p>
              <p className="text-sm mt-1">Add your first member to display them on the homepage.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modal !== null && (
          <MemberModal
            item={modal.id ? modal : null}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Remove Member?</h3>
              <p className="text-gray-500 text-sm mb-5">This will remove them from the Board of Directors section on the homepage.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
