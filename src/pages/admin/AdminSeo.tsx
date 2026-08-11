import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { SeoSettings } from '@/types'

const pages = ['home', 'gallery', 'offer']

export default function AdminSeo() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [selectedPage, setSelectedPage] = useState('home')
  const [seo, setSeo] = useState<Partial<SeoSettings>>({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('seo_settings')
        .select('*')
        .eq('page', selectedPage)
        .maybeSingle()
      if (error) throw error
      setSeo(data || { page: selectedPage })
    } catch (err) {
      console.error('[AdminSeo] load error:', err)
      toastError('SEO ayarları yüklenemedi', 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }, [selectedPage, toastError])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    try {
      const { error } = seo.id
        ? await supabase.from('seo_settings').update({ ...seo, updated_at: new Date().toISOString() }).eq('id', seo.id)
        : await supabase.from('seo_settings').insert({ ...seo, page: selectedPage })
      if (error) throw error
      success(t('admin.saved'))
      load()
    } catch (err) {
      console.error('[AdminSeo] save error:', err)
      toastError('Kayıt başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.seo')}</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
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
            {page.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <Card className="max-w-2xl space-y-4">
          <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
          <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
        </Card>
      ) : (
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
          <Button onClick={save} disabled={saving}>
            {saving ? t('admin.saving') : t('admin.save')}
          </Button>
        </Card>
      )}
    </div>
  )
}
