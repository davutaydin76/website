import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { Client } from '@/types'

const empty: Partial<Client> = {
  name: '', logo_url: '', website_url: '', sort_order: 0, is_active: true,
}

export default function AdminClients() {
  const { t } = useTranslation()
  const [items, setItems] = useState<Client[]>([])
  const [editing, setEditing] = useState<Partial<Client> | null>(null)

  const load = () => {
    supabase.from('clients').select('*').order('sort_order').then(({ data }) => setItems(data || []))
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    if (editing.id) {
      await supabase.from('clients').update(editing).eq('id', editing.id)
    } else {
      await supabase.from('clients').insert(editing)
    }
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    await supabase.from('clients').delete().eq('id', id)
    load()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editing) return
    const path = `logos/${Date.now()}-${file.name}`
    const url = await uploadFile('logos', path, file)
    if (url) setEditing({ ...editing, logo_url: url })
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
          <Input label="Logo URL" value={editing.logo_url || ''} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Logo Yükle</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="text-sm" />
          </div>
          <Input label="Website" value={editing.website_url || ''} onChange={(e) => setEditing({ ...editing, website_url: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>{t('admin.save')}</Button>
            <Button variant="outline" onClick={() => setEditing(null)}>{t('admin.cancel')}</Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 text-center">
            <img src={item.logo_url} alt={item.name} className="h-12 mx-auto object-contain mb-2" />
            <p className="text-sm font-medium">{item.name}</p>
            <div className="flex justify-center gap-1 mt-2">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-neutral-100 rounded">
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
