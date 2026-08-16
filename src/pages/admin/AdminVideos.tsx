import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, VideoOff, Upload, Link as LinkIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { VideoItem } from '@/types'

const VIDEO_CATEGORIES = [
  { value: 'torna', label: 'CNC Torna' },
  { value: 'freze', label: 'CNC Freze' },
  { value: 'kaynak', label: 'Kaynak & İmalat' },
  { value: 'genel', label: 'Genel / Atölye' },
]

const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']

const empty: Partial<VideoItem> = {
  title_tr: '',
  title_en: '',
  video_url: '',
  thumbnail_url: '',
  category: 'genel',
  sort_order: 0,
  is_active: true,
}

type UploadMode = 'url' | 'file'

export default function AdminVideos() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<VideoItem[]>([])
  const [editing, setEditing] = useState<Partial<VideoItem> | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMode, setUploadMode] = useState<UploadMode>('url')
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const { data, error } = await supabase.from('videos').select('*').order('sort_order')
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('[AdminVideos] load error:', err)
      toastError('Veriler yüklenemedi', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|avi|ogg)$/i)) {
      warning('Desteklenmeyen dosya tipi', 'MP4, WebM, MOV veya AVI formatında video yükleyin.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_VIDEO_SIZE) {
      warning('Dosya çok büyük', `Maksimum 100 MB. Seçilen: ${(file.size / 1024 / 1024).toFixed(1)} MB`)
      e.target.value = ''
      return
    }

    setUploading(true)
    setUploadProgress(0)
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4'
      const fileName = `video-${Date.now()}.${fileExt}`
      const path = `${fileName}`

      // Progress simulation (Supabase JS v2 doesn't expose upload progress directly)
      const progressInterval = setInterval(() => {
        setUploadProgress((p) => Math.min(p + 10, 85))
      }, 300)

      const { error } = await supabase.storage
        .from('videos')
        .upload(path, file, { cacheControl: '3600', upsert: false })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (error) {
        console.error('Video yükleme hatası:', error.message, (error as any).details, (error as any).hint)
        throw error
      }

      const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path)
      setEditing((prev) => ({ ...prev, video_url: urlData.publicUrl }))
      success('Video yüklendi!')
    } catch (err: any) {
      console.error('Video yükleme hatası:', err?.message, err?.details, err?.hint)
      toastError('Yükleme hatası', err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      e.target.value = ''
    }
  }

  const save = async () => {
    if (!editing) return
    if (!editing.video_url || !editing.video_url.trim()) {
      toastError('Video URL zorunludur', 'Lütfen video yükleyin veya URL girin.')
      return
    }

    const titleTr = (editing.title_tr || '').trim()
    const titleEn = (editing.title_en || '').trim()
    const videoUrl = editing.video_url.trim()
    const thumbnailUrl = (editing.thumbnail_url || '').trim()
    const category = editing.category || 'genel'
    const sortOrder = Number(editing.sort_order ?? 0)
    const isActive = editing.is_active !== undefined ? Boolean(editing.is_active) : true

    // Supabase 'videos' tablosuna gönderilen senkronize payload
    const payload: Record<string, any> = {
      video_url: videoUrl,
      title_tr: titleTr || null,
      title_en: titleEn || null,
      title: titleTr || titleEn || null, // fallback uyumluluğu için
      category: category,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      is_active: isActive,
    }

    if (thumbnailUrl) {
      payload.thumbnail_url = thumbnailUrl
    }

    // Tanımsız (undefined) alanları temizle
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key]
      }
    })

    try {
      if (editing.id) {
        const { error } = await supabase.from('videos').update(payload).eq('id', editing.id)
        if (error) {
          console.error('Video kayıt hatası:', error.message, error.details, error.hint)
          throw error
        }
      } else {
        const { error } = await supabase.from('videos').insert(payload)
        if (error) {
          console.error('Video kayıt hatası:', error.message, error.details, error.hint)
          throw error
        }
      }
      success(t('admin.saved'))
      setEditing(null)
      load()
    } catch (err: any) {
      console.error('Video kayıt hatası:', err?.message, err?.details, err?.hint)
      toastError('Kayıt başarısız', err?.message || 'Hata oluştu')
    }
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id)
      if (error) {
        console.error('Video silme hatası:', error.message, error.details, error.hint)
        throw error
      }
      success('Video silindi.')
      load()
    } catch (err: any) {
      console.error('Video silme hatası:', err?.message, err?.details, err?.hint)
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  const toggleActive = async (item: VideoItem) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
      if (error) {
        console.error('Video durum güncelleme hatası:', error.message, error.details, error.hint)
        throw error
      }
      success(item.is_active ? 'Video pasife alındı.' : 'Video aktif edildi.')
      load()
    } catch (err: any) {
      console.error('Video durum güncelleme hatası:', err?.message, err?.details, err?.hint)
      toastError('Güncelleme hatası', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.videos')}</h1>
        <Button size="sm" onClick={() => { setEditing({ ...empty }); setUploadMode('url') }}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <h3 className="font-semibold text-base border-b border-neutral-100 dark:border-neutral-800 pb-3">
            {editing.id ? 'Videoyu Düzenle' : 'Yeni Video Ekle'}
          </h3>

          {/* Başlık */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Başlık (TR)"
              value={editing.title_tr || ''}
              onChange={(e) => setEditing({ ...editing, title_tr: e.target.value })}
            />
            <Input
              label="Title (EN)"
              value={editing.title_en || ''}
              onChange={(e) => setEditing({ ...editing, title_en: e.target.value })}
            />
          </div>

          {/* Video Yükleme Modu */}
          <div>
            <label className="block text-sm font-medium mb-2">Video Kaynağı *</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  uploadMode === 'url'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-200 dark:border-neutral-800 text-muted hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <LinkIcon className="w-4 h-4" /> URL Gir
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  uploadMode === 'file'
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-neutral-200 dark:border-neutral-800 text-muted hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <Upload className="w-4 h-4" /> Dosya Yükle
              </button>
            </div>

            {uploadMode === 'url' ? (
              <Input
                label=""
                value={editing.video_url || ''}
                onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                placeholder="https://... (YouTube, Vimeo, MP4 linki)"
              />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov,.avi"
                    onChange={handleVideoUpload}
                    disabled={uploading}
                    className="hidden"
                    id="video-file-upload"
                  />
                  <label
                    htmlFor="video-file-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors w-full justify-center ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-4 h-4 text-accent" />
                    {uploading ? `Yükleniyor... ${uploadProgress}%` : 'MP4 / WebM / MOV seç (max. 100 MB)'}
                  </label>
                </div>
                {uploading && (
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
                    <div
                      className="bg-accent h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {editing.video_url && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                ✓ Video URL ayarlandı: <span className="truncate max-w-xs">{editing.video_url}</span>
              </p>
            )}
          </div>

          {/* Thumbnail */}
          <Input
            label="Thumbnail URL"
            value={editing.thumbnail_url || ''}
            onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })}
            placeholder="https://... (opsiyonel)"
          />

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Kategori</label>
            <select
              value={editing.category || 'genel'}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {VIDEO_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Sıra + Aktiflik */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Sıralama"
              type="number"
              value={editing.sort_order ?? 0}
              onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5">Aktiflik</label>
              <button
                type="button"
                onClick={() => setEditing({ ...editing, is_active: !editing.is_active })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  editing.is_active
                    ? 'border-green-300 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400'
                    : 'border-neutral-200 dark:border-neutral-800 text-muted'
                }`}
              >
                {editing.is_active
                  ? <><ToggleRight className="w-5 h-5" /> Aktif</>
                  : <><ToggleLeft className="w-5 h-5" /> Pasif</>
                }
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={save} disabled={uploading}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-12">Henüz video eklenmemiş.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={`flex items-center justify-between gap-4 ${!item.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title_tr || 'Video Thumbnail'}
                    className="w-16 h-10 object-cover rounded bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  <div className="w-16 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <VideoOff className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.title_tr || '(Başlıksız)'}</p>
                    {item.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted flex-shrink-0">
                        {VIDEO_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted truncate max-w-xs sm:max-w-sm md:max-w-lg">{item.video_url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(item)}
                  aria-label={item.is_active ? 'Pasife al' : 'Aktif et'}
                  className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  {item.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => { setEditing(item); setUploadMode('url') }}
                  aria-label="Düzenle"
                  className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(item.id)}
                  aria-label="Sil"
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
