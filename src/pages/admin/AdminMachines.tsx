import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2, Pencil, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { Machine } from '@/types'

const empty: Partial<Machine> = {
  name_tr: '', name_en: '', description_tr: '', description_en: '', specs: {}, sort_order: 0, is_active: true,
}

export default function AdminMachines() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<Machine[]>([])
  const [editing, setEditing] = useState<Partial<Machine> | null>(null)
  const [specsJson, setSpecsJson] = useState('{}')
  const [specsError, setSpecsError] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data, error } = await Promise.resolve(
        supabase
          .from('machines')
          .select('*')
          .order('sort_order')
      ).catch(() => ({ data: [], error: null }))
      if (error) console.error('[AdminMachines] load:', error.message)
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

  const save = async () => {
    if (!editing) return
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
      const { error } = await Promise.resolve(query).catch(() => ({ error: { message: 'Message channel closed or network error' } as any }))
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
        supabase
          .from('machines')
          .delete()
          .eq('id', id)
      ).catch(() => ({ error: { message: 'Message channel closed or network error' } as any }))
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="heading-md">{t('admin.machines')}</h1>
        <Button size="sm" onClick={() => { setEditing({ ...empty }); setSpecsJson('{}'); setSpecsError(false) }}>
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
          <div>
            <Textarea
              label="Specs (JSON)"
              value={specsJson}
              onChange={(e) => handleSpecsChange(e.target.value)}
              className={specsError ? 'border-red-400 focus:ring-red-400' : ''}
            />
            {specsError && (
              <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3 h-3" /> Geçersiz JSON formatı
              </p>
            )}
          </div>
          <Input label="Sıra" type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={specsError}>{t('admin.save')}</Button>
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
            <Card key={item.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">{item.name_tr}</p>
                <p className="text-sm text-muted truncate">{item.name_en}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(item)} aria-label="Düzenle" className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
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
