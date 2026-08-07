import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Machine } from '@/types'

const empty: Partial<Machine> = {
  name_tr: '', name_en: '', description_tr: '', description_en: '', specs: {}, sort_order: 0, is_active: true,
}

export default function AdminMachines() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Machine[]>([])
  const [editing, setEditing] = useState<Partial<Machine> | null>(null)
  const [specsJson, setSpecsJson] = useState('{}')

  const load = () => {
    supabase.from('machines').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    const specs = JSON.parse(specsJson || '{}')
    const payload = { ...editing, specs }
    if (editing.id) {
      await supabase.from('machines').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('machines').insert(payload)
    }
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    await supabase.from('machines').delete().eq('id', id)
    load()
  }

  const startEdit = (item: Machine) => {
    setEditing(item)
    setSpecsJson(JSON.stringify(item.specs || {}, null, 2))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.machines')}</h1>
        <Button size="sm" onClick={() => { setEditing({ ...empty }); setSpecsJson('{}') }}>
          <Plus className="w-4 h-4" /> {t('admin.add')}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Ad (TR)" value={editing.name_tr || ''} onChange={(e) => setEditing({ ...editing, name_tr: e.target.value })} />
            <Input label="Name (EN)" value={editing.name_en || ''} onChange={(e) => setEditing({ ...editing, name_en: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea label="Açıklama (TR)" value={editing.description_tr || ''} onChange={(e) => setEditing({ ...editing, description_tr: e.target.value })} />
            <Textarea label="Description (EN)" value={editing.description_en || ''} onChange={(e) => setEditing({ ...editing, description_en: e.target.value })} />
          </div>
          <Input label="Görsel URL" value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} />
          <Textarea label="Specs (JSON)" value={specsJson} onChange={(e) => setSpecsJson(e.target.value)} />
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
              <p className="font-medium">{item.name_tr}</p>
              <p className="text-sm text-muted">{item.name_en}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(item)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
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
