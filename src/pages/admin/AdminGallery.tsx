import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, ImageOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { GalleryItem } from '@/types'

const empty: Partial<GalleryItem> = {
  title_tr: '', title_en: '', image_url: '', category: 'general', sort_order: 0, is_active: true,
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AdminGallery() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data, error } = await supabase.from('gallery').select('*').order('sort_order')
    if (error) console.error('[AdminGallery] load:', error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    try {
      const { error } = editing.id
        ? await supabase.from('gallery').update(editing).eq('id', editing.id)
        : await supabase.from('gallery').insert(editing)
      if (error) throw error
      success(t('admin.saved'))
      setEditing(null)
      load()
    } catch (err) {
      toastError('Kayıt başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    try {
      const { error } = await supabase.from('gallery').delete().eq('id', id)
      if (error) throw error
      success('Görsel silindi.')
      load()
    } catch (err) {
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    // Dosya tipi kontrolü
    if (!ALLOWED_TYPES.includes(file.type)) {
      warning('Desteklenmeyen dosya tipi', 'Yalnızca JPEG, PNG, WebP, AVIF veya GIF yükleyebilirsiniz.')
      e.target.value = ''
      return
    }

    // Boyut kontrolü
    if (file.size > MAX_FILE_SIZE) {
      warning('Dosya çok büyük', `Maksimum dosya boyutu 5 MB'dır. Seçilen: ${(file.size / 1024 / 1024).toFixed(1)} MB`)
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `gallery/${Date.now()}.${ext}`
      const url = await uploadFile('gallery', path, file)
      if (url) {
        setEditing({ ...editing, image_url: url })
        success('Görsel yüklendi.')
      } else {
        toastError('Yükleme başarısız', 'Supabase Storage\'a yüklenemedi. Bucket izinlerini kontrol edin.')
      }
    } catch (err) {
      toastError('Yükleme hatası', err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.gallery')}</h1>
        <Button size="sm" onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Başlık (TR)" value={editing.title_tr || ''} onChange={(e) => setEditing({ ...editing, title_tr: e.target.value })} />
            <Input label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
          </div>

          {/* Görsel önizleme */}
          {editing.image_url && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={editing.image_url}
                alt="Önizleme"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}

          <Input label="Görsel URL" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Dosya Yükle <span className="text-muted text-xs">(JPEG/PNG/WebP, maks. 5 MB)</span>
            </label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              onChange={handleUpload}
              disabled={uploading}
              className="text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-neutral-100 dark:file:bg-neutral-800 file:cursor-pointer"
            />
            {uploading && <p className="text-xs text-muted mt-1 animate-pulse">Yükleniyor...</p>}
          </div>

          <Input label="Kategori" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-12">Henüz galeri görseli eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-3">
              {/* Boş/hatalı img src DOM uyarısını önle */}
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title_tr || 'Galeri görseli'}
                  className="w-full h-32 object-cover rounded-lg mb-2 bg-neutral-100 dark:bg-neutral-800"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    e.currentTarget.nextElementSibling?.classList.remove('hidden')
                  }}
                />
              ) : null}
              {(!item.image_url) && (
                <div className="w-full h-32 rounded-lg mb-2 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  <ImageOff className="w-8 h-8 text-neutral-400" />
                </div>
              )}
              <div className="hidden w-full h-32 rounded-lg mb-2 bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                <ImageOff className="w-8 h-8 text-neutral-400" />
              </div>
              <p className="text-sm font-medium truncate">{item.title_tr || '(Başlıksız)'}</p>
              <div className="flex gap-1 mt-2">
                <button onClick={() => setEditing(item)} aria-label="Düzenle" className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => remove(item.id)} aria-label="Sil" className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
