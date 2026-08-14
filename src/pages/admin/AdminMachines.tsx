import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, AlertCircle, Upload, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { Machine } from '@/types'

const MACHINE_CATEGORIES = [
  { value: 'torna', label: 'CNC Torna' },
  { value: 'freze', label: 'CNC Freze' },
  { value: 'kaynak', label: 'Kaynak & İmalat' },
  { value: 'diger', label: 'Diğer' },
]

const empty: Partial<Machine> = {
  name_tr: '',
  name_en: '',
  description_tr: '',
  description_en: '',
  category: 'torna',
  specs: {},
  sort_order: 0,
  is_active: true,
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

export default function AdminMachines() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<Machine[]>([])
  const [editing, setEditing] = useState<Partial<Machine> | null>(null)
  const [specsJson, setSpecsJson] = useState('{}')
  const [specsError, setSpecsError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      const { data, error } = await Promise.resolve(
        supabase
          .from('machines')
          .select('*')
          .order('sort_order')
      ).catch(() => ({ data: [], error: null }))
      if (error) console.error('[AdminMachines] load:', (error as { message?: string }).message)
      setItems(data || [])
    } catch (err) {
      console.error('[AdminMachines] load error:', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load().catch(() => {})
  }, [])

  const handleSpecsChange = (val: string) => {
    setSpecsJson(val)
    try {
      JSON.parse(val)
      setSpecsError(false)
    } catch {
      setSpecsError(true)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      warning('Desteklenmeyen dosya tipi', 'Yalnızca JPEG, PNG, WebP veya AVIF yükleyebilirsiniz.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      warning('Dosya çok büyük', `Maksimum 5 MB. Seçilen: ${(file.size / 1024 / 1024).toFixed(1)} MB`)
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `machines/${Date.now()}.${ext}`
      const url = await uploadFile('gallery', path, file)
      if (url) {
        setEditing((prev) => ({ ...prev, image_url: url }))
        success('Görsel yüklendi.')
      } else {
        toastError('Yükleme başarısız', 'Supabase Storage\'a yüklenemedi.')
      }
    } catch (err) {
      toastError('Yükleme hatası', err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const save = async () => {
    if (!editing) return
    if (!editing.name_tr?.trim()) {
      warning('Zorunlu alan', 'Makine adı (TR) boş bırakılamaz.')
      return
    }
    if (specsError) {
      warning('Geçersiz JSON', 'Specs alanı geçerli bir JSON formatında olmalıdır.')
      return
    }

    let specs: Record<string, unknown> = {}
    try {
      specs = JSON.parse(specsJson || '{}')
    } catch {
      toastError('Geçersiz JSON', 'Specs formatını düzeltin.')
      return
    }

    try {
      const payload = { ...editing, specs }
      const query = editing.id
        ? supabase.from('machines').update(payload).eq('id', editing.id)
        : supabase.from('machines').insert(payload)
      const { error } = await Promise.resolve(query).catch(() => ({ error: { message: 'Bağlantı hatası' } as { message: string } }))
      if (error) throw error
      success(t('admin.saved'))
      setEditing(null)
      load().catch(() => {})
    } catch (err) {
      toastError('Kayıt başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    try {
      const { error } = await Promise.resolve(
        supabase.from('machines').delete().eq('id', id)
      ).catch(() => ({ error: { message: 'Bağlantı hatası' } as { message: string } }))
      if (error) throw error
      success('Makine silindi.')
      load().catch(() => {})
    } catch (err) {
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  const startEdit = (item: Machine) => {
    setEditing(item)
    setSpecsJson(JSON.stringify(item.specs || {}, null, 2))
    setSpecsError(false)
  }

  const toggleActive = async (item: Machine) => {
    try {
      const { error } = await supabase
        .from('machines')
        .update({ is_active: !item.is_active })
        .eq('id', item.id)
      if (error) throw error
      success(item.is_active ? 'Makine pasife alındı.' : 'Makine aktif edildi.')
      load().catch(() => {})
    } catch (err) {
      toastError('Güncelleme hatası', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.machines')}</h1>
        <Button size="sm" onClick={() => { setEditing({ ...empty }); setSpecsJson('{}'); setSpecsError(false) }}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <h3 className="font-semibold text-base border-b border-neutral-100 dark:border-neutral-800 pb-3">
            {editing.id ? 'Makineyi Düzenle' : 'Yeni Makine Ekle'}
          </h3>

          {/* Ad (TR/EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Ad (TR) *"
              value={editing.name_tr || ''}
              onChange={(e) => setEditing({ ...editing, name_tr: e.target.value })}
            />
            <Input
              label="Name (EN)"
              value={editing.name_en || ''}
              onChange={(e) => setEditing({ ...editing, name_en: e.target.value })}
            />
          </div>

          {/* Açıklama (TR/EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Açıklama (TR)"
              value={editing.description_tr || ''}
              onChange={(e) => setEditing({ ...editing, description_tr: e.target.value })}
            />
            <Textarea
              label="Description (EN)"
              value={editing.description_en || ''}
              onChange={(e) => setEditing({ ...editing, description_en: e.target.value })}
            />
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Kategori</label>
            <select
              value={editing.category || 'torna'}
              onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {MACHINE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Specs (JSON) */}
          <div>
            <Textarea
              label="Özellikler / Specs (JSON)"
              value={specsJson}
              onChange={(e) => handleSpecsChange(e.target.value)}
              className={specsError ? 'border-red-400 focus:ring-red-400' : ''}
            />
            <p className="text-xs text-muted mt-1">
              Örnek: {`{"X": "1300mm", "Z": "800mm", "Eksen": "3"}`}
            </p>
            {specsError && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3 h-3" /> Geçersiz JSON formatı
              </p>
            )}
          </div>

          {/* Görsel */}
          {editing.image_url && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
              <img
                src={editing.image_url}
                alt="Önizleme"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <button
                type="button"
                onClick={() => setEditing({ ...editing, image_url: '' })}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/60 text-white rounded-lg hover:bg-black/80"
              >
                Kaldır
              </button>
            </div>
          )}

          <Input
            label="Görsel URL"
            value={editing.image_url || ''}
            onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
            placeholder="https://... veya aşağıdan dosya yükleyin"
          />

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Dosya Yükle <span className="text-muted text-xs">(JPEG/PNG/WebP, maks. 5 MB)</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="machine-image-upload"
              />
              <label
                htmlFor="machine-image-upload"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Yükleniyor...' : 'Görsel Seç'}
              </label>
              {uploading && <span className="text-xs text-muted animate-pulse">Yükleniyor...</span>}
            </div>
          </div>

          {/* Sıra + Aktif */}
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
            <Button onClick={save} disabled={specsError || uploading}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-12">Henüz makine eklenmemiş.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className={`flex items-center justify-between gap-4 ${!item.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-4 min-w-0">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name_tr}
                    className="w-14 h-10 object-cover rounded-lg bg-neutral-100 dark:bg-neutral-800 flex-shrink-0"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.name_tr}</p>
                    {item.category && (
                      <span className="hidden sm:inline-block px-2 py-0.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-800 text-muted flex-shrink-0">
                        {MACHINE_CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted truncate">{item.name_en}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(item)}
                  aria-label={item.is_active ? 'Pasife al' : 'Aktif et'}
                  className={`p-2 rounded-lg transition-colors ${item.is_active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                  title={item.is_active ? 'Aktif — tıkla pasife al' : 'Pasif — tıkla aktif et'}
                >
                  {item.is_active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => startEdit(item)}
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
