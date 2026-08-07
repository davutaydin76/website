import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { HeroContent } from '@/types'

export default function AdminHero() {
  const { t } = useTranslation()
  const [hero, setHero] = useState<Partial<HeroContent>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('hero_content')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()
      .then(({ data }) => { if (data) setHero(data) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    const { error } = hero.id
      ? await supabase.from('hero_content').update({ ...hero, updated_at: new Date().toISOString() }).eq('id', hero.id)
      : await supabase.from('hero_content').insert(hero)
    setSaving(false)
    setMessage(error ? error.message : t('admin.saved'))
  }

  const update = (field: keyof HeroContent, value: string) => {
    setHero((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.hero')}</h1>
      <Card className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Başlık (TR)" value={hero.title_tr || ''} onChange={(e) => update('title_tr', e.target.value)} />
          <Input label="Title (EN)" value={hero.title_en || ''} onChange={(e) => update('title_en', e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Textarea label="Alt Başlık (TR)" value={hero.subtitle_tr || ''} onChange={(e) => update('subtitle_tr', e.target.value)} />
          <Textarea label="Subtitle (EN)" value={hero.subtitle_en || ''} onChange={(e) => update('subtitle_en', e.target.value)} />
        </div>
        <Input label="Video URL" value={hero.video_url || ''} onChange={(e) => update('video_url', e.target.value)} />
        <Input label="Görsel URL" value={hero.image_url || ''} onChange={(e) => update('image_url', e.target.value)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="CTA Primary (TR)" value={hero.cta_primary_tr || ''} onChange={(e) => update('cta_primary_tr', e.target.value)} />
          <Input label="CTA Primary (EN)" value={hero.cta_primary_en || ''} onChange={(e) => update('cta_primary_en', e.target.value)} />
          <Input label="CTA Secondary (TR)" value={hero.cta_secondary_tr || ''} onChange={(e) => update('cta_secondary_tr', e.target.value)} />
          <Input label="CTA Secondary (EN)" value={hero.cta_secondary_en || ''} onChange={(e) => update('cta_secondary_en', e.target.value)} />
        </div>
        {message && <p className={`text-sm ${message === t('admin.saved') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </Card>
    </div>
  )
}
