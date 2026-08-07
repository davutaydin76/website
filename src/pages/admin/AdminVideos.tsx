import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { VideoItem } from '@/types'

const empty: Partial<VideoItem> = {
  title_tr: '', title_en: '', video_url: '', thumbnail_url: '', category: 'general', sort_order: 0, is_active: true,
}

export default function AdminVideos() {
  const { t } = useTranslation()
  const [items, setItems] = useState<VideoItem[]>([])
  const [editing, setEditing] = useState<Partial<VideoItem> | null>(null)

  const load = () => {
    supabase.from('videos').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (editing.id) {
      await supabase.from('videos').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('videos').insert(editing)
    }
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    await supabase.from('videos').delete().eq('id', id)
    load()
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
          <div className="flex gap-2">
            <Button onClick={save}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{item.title_tr}</p>
              <p className="text-sm text-muted truncate max-w-md">{item.video_url}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(item)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(item.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
