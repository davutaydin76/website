import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { Service } from '@/types'

const emptyService: Partial<Service> = {
  title_tr: '', title_en: '', description_tr: '', description_en: '', icon: 'cog', sort_order: 0, is_active: true,
}

export default function AdminServices() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [items, setItems] = useState<Service[]>([])
  const [editing, setEditing] = useState<Partial<Service> | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const { data, error } = await supabase.from('services').select('*').order('sort_order')
    if (error) console.error('[AdminServices] load:', error.message)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!editing) return
    try {
      const { error } = editing.id
        ? await supabase.from('services').update(editing).eq('id', editing.id)
        : await supabase.from('services').insert(editing)
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
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      success('Hizmet silindi.')
      load()
    } catch (err) {
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
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
          <Input label="Icon (lucide adı)" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
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
            <div key={i} className="h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted text-center py-12">Henüz hizmet eklenmemiş.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{item.title_tr}</p>
                <p className="text-sm text-muted truncate">{item.title_en}</p>
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
