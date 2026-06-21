import { useState, useMemo, useRef, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { MdAdd, MdEdit, MdDelete, MdClose, MdArticle, MdArrowBack, MdDownload, MdCrop, MdCloudUpload, MdLink } from 'react-icons/md'
import { query, orderBy, serverTimestamp } from 'firebase/firestore'
import { blogCol } from '../../firebase/collections'
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
  const canvas = document.createElement('canvas')
  canvas.width  = pixelCrop.width
  canvas.height = pixelCrop.height
  canvas.getContext('2d').drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height
  )
  return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92))
}

async function uploadToCloudinary(file, onProgress) {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', CLOUD_PRESET)
  fd.append('folder', 'blog')
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
    xhr.onerror = () => reject(new Error('Network error'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(fd)
  })
}

async function uploadUrlToCloudinary(imageUrl) {
  const fd = new FormData()
  fd.append('file', imageUrl)
  fd.append('upload_preset', CLOUD_PRESET)
  fd.append('folder', 'blog')
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
    <div className="fixed inset-0 z-[70] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3 shrink-0 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <MdCrop size={20} className="text-gold" />
          <span className="font-bold text-sm">Crop Featured Image</span>
          <span className="text-white/40 text-xs ml-1">Landscape crop (16:9) works best for blog posts</span>
        </div>
        <button onClick={onCancel} className="text-white/50 hover:text-white">✕</button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={16 / 9}
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
              <span>Uploading to Cloudinary...</span><span>{uploadPct}%</span>
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

const SEED_POSTS = [
  {
    title: 'Tiptoe Sports Academy Students Complete Thailand Training Camp with Silie Sports Club',
    slug: 'tiptoe-students-thailand-training-camp-silie-sports-club',
    category: 'International',
    excerpt: 'Selected students from Tiptoe Sports Academy traveled to Bangkok for an intensive football training camp with Silie Sports Club, gaining international match experience against Thai Division sides.',
    content: '<p>Selected students from Tiptoe Sports Academy traveled to Bangkok for an intensive football training camp with Silie Sports Club, gaining international match experience against Thai Division sides.</p><p>This once-in-a-lifetime exchange program gave our students the opportunity to train alongside Thai youth professionals, experience international-level coaching, and represent Nepal abroad.</p>',
    author: 'Tiptoe Sports Hub',
    status: 'published',
    imageURL: '',
    publishedAt: new Date('2025-03-01'),
  },
  {
    title: "Nepal's #1 Football Academy: How Tiptoe Sports Hub Develops Champions from Age 4",
    slug: 'nepal-football-academy-tiptoe-sports-hub-develops-champions',
    category: 'Coaching',
    excerpt: "Tiptoe Sports Academy's structured age-group programs guide young athletes from their first kick at age 4 all the way to elite-level competition at 18, with professional national-level coaching at every stage.",
    content: "<p>Tiptoe Sports Academy's structured age-group programs guide young athletes from their first kick at age 4 all the way to elite-level competition at 18, with professional national-level coaching at every stage.</p><p>Our curriculum is designed by Nepal's finest football minds, including Head Coach Gaurav Basnet who served as Nepal National Futsal Head Coach for three consecutive terms.</p>",
    author: 'Tiptoe Sports Hub',
    status: 'published',
    imageURL: '',
    publishedAt: new Date('2025-01-15'),
  },
  {
    title: 'Meet Gaurav Basnet: The Coach Who Led Nepal to Three Futsal Championships',
    slug: 'gaurav-basnet-nepal-futsal-coach-tiptoe-sports-academy',
    category: 'Coaching',
    excerpt: "Nepal National Futsal Team Head Coach for three consecutive terms, Gaurav Basnet brings world-class expertise to every session at Tiptoe Sports Academy in Tarkeshwar, Kathmandu.",
    content: "<p>With over 27 years in football, Gaurav Basnet is one of Nepal's most respected football minds. As former Head Coach of the Nepal National Futsal Team for three consecutive terms and former coach of Manang Marshyangdi Club in Nepal's A Division, he has brought international-level expertise to Tiptoe Sports Academy.</p><p>Coach Gaurav co-founded Tiptoe Sports Hub in 2021 with a vision to create a world-class football development environment for Nepali youth.</p>",
    author: 'Tiptoe Sports Hub',
    status: 'published',
    imageURL: '',
    publishedAt: new Date('2024-11-20'),
  },
]

const CATEGORIES = ['News', 'Training', 'Events', 'International', 'Coaching']
const EMPTY = { title: '', slug: '', category: 'News', content: '', excerpt: '', imageURL: '', status: 'draft', author: '' }

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function BlogEditor({ item, onClose, onSave }) {
  const [form, setForm]       = useState(item || EMPTY)
  const [saving, setSaving]   = useState(false)
  const [cropSrc, setCropSrc] = useState(null)
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
      set('imageURL', url)
      setCropSrc(null)
      toast.success('Featured image uploaded!')
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
      set('imageURL', cloudUrl)
      setImportUrl('')
      toast.success('Image imported to Cloudinary!')
    } catch (err) {
      toast.error(err.message || 'Import failed — make sure the URL is a direct image link.')
    } finally {
      setImporting(false)
    }
  }

  const handleSave = async (status) => {
    if (!form.title) { toast.error('Title is required.'); return }
    setSaving(true)
    try {
      const slug = form.slug || slugify(form.title)
      await onSave({ ...form, slug, status, publishedAt: status === 'published' ? serverTimestamp() : form.publishedAt })
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

    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-navy rounded-lg transition-colors"><MdArrowBack size={20} /></button>
          <h2 className="font-bold text-navy">{item?.id ? 'Edit Post' : 'New Post'}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave('draft')} disabled={saving} className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-60">
            Save Draft
          </button>
          <button onClick={() => handleSave('published')} disabled={saving} className="btn-primary text-sm py-2 disabled:opacity-60">
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
        {/* Featured Image */}
        <div className="bg-white rounded-2xl p-5 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Featured Image</label>

          {/* Preview */}
          {form.imageURL && (
            <div className="relative">
              <img src={form.imageURL} alt="" className="w-full h-48 object-cover rounded-xl" onError={e => e.target.style.display='none'} />
              <button
                type="button"
                onClick={() => set('imageURL', '')}
                className="absolute top-2 right-2 bg-black/60 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Upload from device */}
          <input type="file" accept="image/*" ref={fileRef} onChange={handleFileSelect} className="hidden" />
          {canUpload ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || importing}
              className="btn-primary text-sm py-3 w-full justify-center gap-2 disabled:opacity-60"
            >
              <MdCrop size={18} />
              {uploading ? `Uploading… ${uploadPct}%` : 'Upload & Crop Photo'}
            </button>
          ) : (
            <div className="text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-xl p-3">
              <strong>Setup needed:</strong> Add <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_CLOUD_NAME</code> and <code className="bg-amber-100 px-1 rounded">VITE_CLOUDINARY_UPLOAD_PRESET</code> to Vercel settings.
            </div>
          )}

          {uploading && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green transition-all duration-200" style={{ width: `${uploadPct}%` }} />
            </div>
          )}

          {/* Import from URL */}
          {canUpload && (
            <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                <MdLink size={14} /> Import from URL (Facebook, Google Photos, WhatsApp…)
              </p>
              <div className="flex gap-2">
                <input
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  className="input-field flex-1 text-sm"
                  placeholder="Paste direct image URL here…"
                  onKeyDown={e => e.key === 'Enter' && handleImportUrl()}
                />
                <button
                  type="button"
                  onClick={handleImportUrl}
                  disabled={importing || !importUrl.trim()}
                  className="btn-primary text-sm py-2.5 whitespace-nowrap disabled:opacity-60"
                >
                  {importing ? 'Importing…' : 'Import'}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                <strong>Facebook:</strong> Right-click the photo → <em>"Copy image address"</em> → paste here.
              </p>
            </div>
          )}

          {/* Manual URL fallback */}
          <div>
            <input
              value={form.imageURL}
              onChange={e => set('imageURL', e.target.value)}
              className="input-field text-sm"
              placeholder="Or paste a Cloudinary / direct image URL manually"
            />
            <p className="text-xs text-gray-400 mt-1">Tip: 16:9 landscape images (e.g. 1200×675px) look best as blog featured images.</p>
          </div>
        </div>

        {/* Meta */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
            <input
              value={form.title}
              onChange={e => { set('title', e.target.value); if (!form.id) set('slug', slugify(e.target.value)) }}
              className="input-field text-lg font-semibold"
              placeholder="Post title..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Slug</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input-field font-mono text-sm" placeholder="url-friendly-slug" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
              <input value={form.author} onChange={e => set('author', e.target.value)} className="input-field" placeholder="Author name" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt</label>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} className="input-field resize-none" placeholder="Short description..." />
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-2xl p-5">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Content</label>
          <ReactQuill
            theme="snow"
            value={form.content}
            onChange={v => set('content', v)}
            modules={QUILL_MODULES}
            className="min-h-[300px]"
          />
        </div>
      </div>
    </div>
    </>
  )
}

export default function ManageBlog() {
  const [editor, setEditor]   = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [seeding, setSeeding] = useState(false)
  const q = useMemo(() => query(blogCol, orderBy('createdAt', 'desc')), [])
  const { docs: posts, loading } = useCollection(q)

  const handleSeedDefaults = async () => {
    setSeeding(true)
    try {
      await Promise.all(SEED_POSTS.map(p => addDocument(blogCol, p)))
      toast.success('3 default posts imported!')
    } catch { toast.error('Failed to import defaults.') }
    finally { setSeeding(false) }
  }

  const handleSave = async (form) => {
    if (form.id) {
      const { id, ...data } = form
      await updateDocument('blog', id, data)
      toast.success('Post saved!')
    } else {
      await addDocument(blogCol, form)
      toast.success('Post created!')
    }
  }

  const handleDelete = async () => {
    await deleteDocument('blog', deleteId)
    toast.success('Post deleted.')
    setDeleteId(null)
  }

  const toggleStatus = async (post) => {
    const status = post.status === 'published' ? 'draft' : 'published'
    await updateDocument('blog', post.id, { status })
    toast.success(`Post ${status}.`)
  }

  function formatDate(ts) {
    if (!ts) return '—'
    const d = ts?.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString('en-NP', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-black text-2xl text-navy">Blog</h1>
            <p className="text-gray-500 text-sm">{posts.length} posts</p>
          </div>
          <button onClick={() => setEditor({})} className="btn-primary text-sm py-2.5"><MdAdd size={18} /> New Post</button>
        </div>

        {/* Seed defaults banner */}
        {!loading && posts.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
            <MdDownload size={24} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-800 text-sm">No blog posts yet</p>
              <p className="text-blue-600 text-xs mt-1">Import the 3 sample posts that are currently showing on the public website so you can manage and edit them here.</p>
            </div>
            <button
              onClick={handleSeedDefaults}
              disabled={seeding}
              className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60"
            >
              {seeding ? 'Importing...' : 'Import 3 Defaults'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Post</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.imageURL && <img src={post.imageURL} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                          <div>
                            <div className="font-semibold text-navy line-clamp-1">{post.title}</div>
                            {post.author && <div className="text-xs text-gray-400">By {post.author}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{post.category}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleStatus(post)} className={`text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${post.status === 'published' ? 'bg-green/10 text-green hover:bg-green/20' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                          {post.status === 'published' ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{formatDate(post.publishedAt || post.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditor(post)} className="p-1.5 text-gray-400 hover:text-navy hover:bg-navy/5 rounded-lg transition-colors"><MdEdit size={16} /></button>
                          <button onClick={() => setDeleteId(post.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><MdDelete size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-gray-400">
              <MdArticle size={48} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No posts yet. Write your first post.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editor !== null && (
          <BlogEditor item={editor.id ? editor : null} onClose={() => setEditor(null)} onSave={handleSave} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <h3 className="font-bold text-lg text-navy mb-2">Delete Post?</h3>
              <p className="text-gray-500 text-sm mb-5">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline border-gray-300 text-gray-600 justify-center">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
