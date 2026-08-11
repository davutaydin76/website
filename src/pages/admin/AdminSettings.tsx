import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { ContactSettings, CounterSettings } from '@/types'

export default function AdminSettings() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [contact, setContact] = useState<ContactSettings>({
    phone: '', email: '', whatsapp: '', address_tr: '', address_en: '',
  })
  const [counters, setCounters] = useState<CounterSettings>({
    projects: 0, clients: 0, capacity: 0,
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      data?.forEach((row) => {
        if (row.key === 'contact') setContact(row.value as ContactSettings)
        if (row.key === 'counters') setCounters(row.value as CounterSettings)
      })
    } catch (err) {
      console.error('[AdminSettings] load error:', err)
      toastError('Ayarlar yüklenemedi', 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    setSaving(true)
    try {
      const [c1, c2] = await Promise.all([
        supabase.from('settings').upsert({ key: 'contact', value: contact, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
        supabase.from('settings').upsert({ key: 'counters', value: counters, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      ])
      if (c1.error) throw c1.error
      if (c2.error) throw c2.error
      success(t('admin.saved'))
    } catch (err) {
      console.error('[AdminSettings] save error:', err)
      toastError('Ayarlar kaydedilemedi', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.settings')}</h1>

      {loading ? (
        <div className="space-y-6 max-w-2xl animate-pulse">
          <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-40 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-8 max-w-2xl">
          <Card className="space-y-4">
            <h2 className="font-semibold text-lg">İletişim Bilgileri</h2>
            <Input label="Telefon" value={contact.phone || ''} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
            <Input label="E-posta" value={contact.email || ''} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
            <Input label="WhatsApp" value={contact.whatsapp || ''} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
            <Input label="Adres (TR)" value={contact.address_tr || ''} onChange={(e) => setContact({ ...contact, address_tr: e.target.value })} />
            <Input label="Address (EN)" value={contact.address_en || ''} onChange={(e) => setContact({ ...contact, address_en: e.target.value })} />
          </Card>

          <Card className="space-y-4">
            <h2 className="font-semibold text-lg">Sayaçlar</h2>
            <Input label="Tamamlanan Projeler" type="number" value={counters.projects ?? 0} onChange={(e) => setCounters({ ...counters, projects: Number(e.target.value) })} />
            <Input label="Aktif Müşteriler" type="number" value={counters.clients ?? 0} onChange={(e) => setCounters({ ...counters, clients: Number(e.target.value) })} />
            <Input label="Üretim Kapasitesi (%)" type="number" value={counters.capacity ?? 0} onChange={(e) => setCounters({ ...counters, capacity: Number(e.target.value) })} />
          </Card>

          <Button onClick={save} disabled={saving}>
            {saving ? t('admin.saving') : t('admin.save')}
          </Button>
        </div>
      )}
    </div>
  )
}
