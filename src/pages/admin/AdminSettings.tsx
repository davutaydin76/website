import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { ContactSettings, CounterSettings } from '@/types'

export default function AdminSettings() {
  const { t } = useTranslation()
  const [contact, setContact] = useState<ContactSettings>({
    phone: '', email: '', whatsapp: '', address_tr: '', address_en: '',
  })
  const [counters, setCounters] = useState<CounterSettings>({
    projects: 0, clients: 0, capacity: 0,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('settings').select('*').then(({ data }) => {
      data?.forEach((row) => {
        if (row.key === 'contact') setContact(row.value as ContactSettings)
        if (row.key === 'counters') setCounters(row.value as CounterSettings)
      })
    })
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage('')
    const [c1, c2] = await Promise.all([
      supabase.from('settings').upsert({ key: 'contact', value: contact, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
      supabase.from('settings').upsert({ key: 'counters', value: counters, updated_at: new Date().toISOString() }, { onConflict: 'key' }),
    ])
    setSaving(false)
    setMessage(c1.error || c2.error ? 'Hata oluştu' : t('admin.saved'))
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.settings')}</h1>

      <div className="space-y-8 max-w-2xl">
        <Card className="space-y-4">
          <h2 className="font-semibold text-lg">İletişim Bilgileri</h2>
          <Input label="Telefon" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
          <Input label="E-posta" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
          <Input label="WhatsApp" value={contact.whatsapp} onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })} />
          <Input label="Adres (TR)" value={contact.address_tr} onChange={(e) => setContact({ ...contact, address_tr: e.target.value })} />
          <Input label="Address (EN)" value={contact.address_en} onChange={(e) => setContact({ ...contact, address_en: e.target.value })} />
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-lg">Sayaçlar</h2>
          <Input label="Tamamlanan Projeler" type="number" value={counters.projects} onChange={(e) => setCounters({ ...counters, projects: Number(e.target.value) })} />
          <Input label="Aktif Müşteriler" type="number" value={counters.clients} onChange={(e) => setCounters({ ...counters, clients: Number(e.target.value) })} />
          <Input label="Üretim Kapasitesi (%)" type="number" value={counters.capacity} onChange={(e) => setCounters({ ...counters, capacity: Number(e.target.value) })} />
        </Card>

        {message && <p className={`text-sm ${message === t('admin.saved') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        <Button onClick={save} disabled={saving}>
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </div>
    </div>
  )
}
