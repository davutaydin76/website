import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Service } from '@/types'

const emptyService: Partial<Service> = {
  title_tr: '', title_en: '', description_tr: '', description_en: '', icon: 'cog', sort_order: 0, is_active: true,
}

export default function AdminServices() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Service[]>([])
  const [editing, setEditing] = useState<Partial<Service> | null>(null)

  const load = () => {
    supabase.from('services').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (editing.id) {
      await supabase.from('services').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('services').insert(editing)
    }
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    await supabase.from('services').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.services')}</h1>
        <Button size="sm" onClick={() => setEditing({ ...emptyService })}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Başlık (TR)" value={editing.title_tr || ''} onChange={(e) => setEditing({ ...editing, title_tr: e.target.value })} />
            <Input label="Title (EN)" value={editing.title_en || ''} onChange={(e) => setEditing({ ...editing, title_en: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea label="Açıklama (TR)" value={editing.description_tr || ''} onChange={(e) => setEditing({ ...editing, description_tr: e.target.value })} />
            <Textarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          </div>
          <Input label="Icon" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
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
              <p className="text-sm text-muted">{item.title_en}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(item)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(item.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
