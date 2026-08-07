import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { GalleryItem } from '@/types'

const empty: Partial<GalleryItem> = {
  title_tr: '', title_en: '', image_url: '', category: 'general', sort_order: 0, is_active: true,
}

export default function AdminGallery() {
  const { t } = useTranslation()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [editing, setEditing] = useState<Partial<GalleryItem> | null>(null)

  const load = () => {
    supabase.from('gallery').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (editing.id) {
      await supabase.from('gallery').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('gallery').insert(editing)
    }
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    await supabase.from('gallery').delete().eq('id', id)
    load()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    const path = `gallery/${Date.now()}-${file.name}`
    const url = await uploadFile('gallery', path, file)
    if (url) setEditing({ ...editing, image_url: url })
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
          <Input label="Görsel URL" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Dosya Yükle</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          </div>
          <Input label="Kategori" value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button onClick={save}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-3">
            <img src={item.image_url} alt={item.title_tr || ''} className="w-full h-32 object-cover rounded-lg mb-2" />
            <p className="text-sm font-medium truncate">{item.title_tr}</p>
            <div className="flex gap-1 mt-2">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => remove(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
