import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { SeoSettings } from '@/types'

const pages = ['home', 'gallery', 'offer']

export default function AdminSeo() {
  const { t } = useTranslation()
  const [selectedPage, setSelectedPage] = useState('home')
  const [seo, setSeo] = useState<Partial<SeoSettings>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase
      .from('seo_settings')
      .select('*')
      .eq('page', selectedPage)
      .single()
      .then(({ data }) => setSeo(data || { page: selectedPage }))
  }, [selectedPage])

  const save = async () => {
    setSaving(true)
    setMessage('')
    const { error } = seo.id
      ? await supabase.from('seo_settings').update({ ...seo, updated_at: new Date().toISOString() }).eq('id', seo.id)
      : await supabase.from('seo_settings').insert({ ...seo, page: selectedPage })
    setSaving(false)
    setMessage(error ? error.message : t('admin.saved'))
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.seo')}</h1>

      <div className="flex gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setSelectedPage(page)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedPage === page
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-muted'
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <Card className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Title (TR)" value={seo.title_tr || ''} onChange={(e) => setSeo({ ...seo, title_tr: e.target.value })} />
          <Input label="Title (EN)" value={seo.title_en || ''} onChange={(e) => setSeo({ ...seo, title_en: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Textarea label="Description (TR)" value={seo.description_tr || ''} onChange={(e) => setSeo({ ...seo, description_tr: e.target.value })} />
          <Textarea label="Description (EN)" value={seo.description_en || ''} onChange={(e) => setSeo({ ...seo, description_en: e.target.value })} />
        </div>
        <Input label="OG Image URL" value={seo.og_image_url || ''} onChange={(e) => setSeo({ ...seo, og_image_url: e.target.value })} />
        <Input label="Keywords" value={seo.keywords || ''} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
        {message && <p className={`text-sm ${message === t('admin.saved') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
        <Button onClick={save} disabled={saving}>
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </Card>
    </div>
  )
}
