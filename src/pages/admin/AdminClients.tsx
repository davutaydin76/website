import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, ImageOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { Client } from '@/types'

const empty: Partial<Client> = {
  name: '', logo_url: '', website: '', sort_order: 0, is_active: true,
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AdminClients() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<Client[]>([])
  const [editing, setEditing] = useState<Partial<Client> | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data, error } = await supabase.from('clients').select('*').order('sort_order')
      if (error) throw error
      setItems(data || [])
    } catch (err) {
      console.error('[AdminClients] load error:', err)
      toastError('Müşteri verileri yüklenemedi', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (!editing.name) {
      toastError('Firma adı zorunludur', 'Lütfen geçerli bir firma adı girin.')
      return
    }
    if (!editing.logo_url) {
      toastError('Logo yüklenmesi veya URL girmesi zorunludur.', 'Lütfen bir logo ekleyin.')
      return
    }

    try {
      const payload = {
        name: editing.name,
        logo_url: editing.logo_url,
        website: editing.website || null,
        sort_order: Number(editing.sort_order) || 0,
        is_active: editing.is_active !== false
      }
      const { error } = editing.id
        ? await supabase.from('clients').update(payload).eq('id', editing.id)
        : await supabase.from('clients').insert(payload)
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
      const { error } = await supabase.from('clients').delete().eq('id', id)
      if (error) throw error
      success('Müşteri kaydı silindi.')
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
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
      const path = `logos/${Date.now()}.${ext}`
      const url = await uploadFile('logos', path, file)
      if (url) {
        setEditing({ ...editing, logo_url: url })
        success('Logo yüklendi.')
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
        <h1 className="heading-md">{t('admin.clients')}</h1>
        <Button size="sm" onClick={() => setEditing({ ...empty })}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <Input label="Firma Adı" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />

          {/* Logo önizleme */}
          {editing.logo_url && (
            <div className="relative w-32 h-16 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 p-2 flex items-center justify-center">
              <img
                src={editing.logo_url}
                alt="Önizleme"
                className="max-w-full max-h-full object-contain"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}

          <Input label="Logo URL" value={editing.logo_url || ''} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Logo Yükle <span className="text-muted text-xs">(JPEG/PNG/WebP, maks. 5 MB)</span>
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
          <Input label="Website" value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} />
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={uploading}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-12">Henüz müşteri eklenmemiş.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4 text-center flex flex-col justify-between h-full">
              <div className="flex-1 flex items-center justify-center min-h-[4rem]">
                {item.logo_url ? (
                  <img
                    src={item.logo_url}
                    alt={item.name || 'Müşteri logosu'}
                    className="h-12 max-w-full object-contain mb-2 bg-neutral-100 dark:bg-neutral-800 rounded p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="w-full h-12 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-neutral-400" />
                  </div>
                )}
                <div className="hidden w-full h-12 rounded bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                  <ImageOff className="w-6 h-6 text-neutral-400" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium truncate mt-2">{item.name}</p>
                <div className="flex justify-center gap-1 mt-2">
                  <button onClick={() => setEditing(item)} aria-label="Düzenle" className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => remove(item.id)} aria-label="Sil" className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
