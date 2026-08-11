import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, VideoOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { VideoItem } from '@/types'

const empty: Partial<VideoItem> = {
  title_tr: '', title_en: '', video_url: '', thumbnail_url: '', category: 'general', sort_order: 0, is_active: true,
}

export default function AdminVideos() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [items, setItems] = useState<VideoItem[]>([])
  const [editing, setEditing] = useState<Partial<VideoItem> | null>(null)
  const [loading, setLoading] = useState(true)

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

  const save = async () => {
    if (!editing) return
    if (!editing.video_url) {
      toastError('Video URL zorunludur', 'Lütfen geçerli bir video bağlantısı girin.')
      return
    }

    try {
      const { error } = editing.id
        ? await supabase.from('videos').update(editing).eq('id', editing.id)
        : await supabase.from('videos').insert(editing)
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
      const { error } = await supabase.from('videos').delete().eq('id', id)
      if (error) throw error
      success('Video silindi.')
      load()
    } catch (err) {
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.videos')}</h1>
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
          <Input label="Video URL" value={editing.video_url || ''} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} />
          <Input label="Thumbnail URL" value={editing.thumbnail_url || ''} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
          <Input label="Kategori" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button onClick={save}>{t('admin.save')}</Button>
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
            <Card key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                {item.thumbnail_url ? (
                  <img
                    src={item.thumbnail_url}
                    alt={item.title_tr || 'Video Thumbnail'}
                    className="w-16 h-10 object-cover rounded bg-neutral-100 dark:bg-neutral-800"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : (
                  <div className="w-16 h-10 rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    <VideoOff className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
                <div className="hidden w-16 h-10 rounded bg-neutral-100 dark:bg-neutral-800 items-center justify-center">
                  <VideoOff className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{item.title_tr}</p>
                  <p className="text-sm text-muted truncate max-w-xs sm:max-w-md md:max-w-lg">{item.video_url}</p>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(item)} aria-label="Düzenle" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => remove(item.id)} aria-label="Sil" className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500 transition-colors">
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
