import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { HeroContent } from '@/types'
import { Upload, Image as ImageIcon } from 'lucide-react'

const ALLOWED_BG_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_BG_SIZE = 10 * 1024 * 1024 // 10MB

export default function AdminHero() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [hero, setHero] = useState<Partial<HeroContent>>({})
  const [saving, setSaving] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)

  useEffect(() => {
    supabase
      .from('hero_content')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error('[AdminHero] fetch:', error.message)
        if (data) setHero(data)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = hero.id
        ? await supabase
            .from('hero_content')
            .update({ ...hero, updated_at: new Date().toISOString() })
            .eq('id', hero.id)
        : await supabase.from('hero_content').insert({ ...hero, is_active: true })

      if (error) throw error
      success(t('admin.saved'), 'Hero içeriği güncellendi.')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      toastError('Kayıt başarısız', msg)
    } finally {
      setSaving(false)
    }
  }

  const update = (field: keyof HeroContent, value: string) =>
    setHero((prev) => ({ ...prev, [field]: value }))

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_BG_TYPES.includes(file.type)) {
      warning('Desteklenmeyen dosya tipi', 'JPEG, PNG, WebP veya AVIF yükleyin.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_BG_SIZE) {
      warning('Dosya çok büyük', `Maksimum 10 MB. Seçilen: ${(file.size / 1024 / 1024).toFixed(1)} MB`)
      e.target.value = ''
      return
    }

    setUploadingBg(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `hero/${Date.now()}.${ext}`
      const url = await uploadFile('gallery', path, file)
      if (url) {
        update('background_image', url)
        success('Arka plan görseli yüklendi.')
      } else {
        toastError('Yükleme başarısız', 'Supabase Storage\'a yüklenemedi. Bucket izinlerini kontrol edin.')
      }
    } catch (err) {
      toastError('Yükleme hatası', err instanceof Error ? err.message : 'Bilinmeyen hata')
    } finally {
      setUploadingBg(false)
      e.target.value = ''
    }
  }

  return (
    <div className="w-full">
      <h1 className="heading-md mb-8">{t('admin.hero')}</h1>
      <Card className="space-y-6 max-w-3xl">
        {/* Başlık ve Alt Başlık */}
        <div>
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Başlık & Alt Başlık</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Başlık (TR)" value={hero.title_tr || ''} onChange={(e) => update('title_tr', e.target.value)} />
            <Input label="Title (EN)" value={hero.title_en || ''} onChange={(e) => update('title_en', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Textarea label="Alt Başlık (TR)" value={hero.subtitle_tr || ''} onChange={(e) => update('subtitle_tr', e.target.value)} />
            <Textarea label="Subtitle (EN)" value={hero.subtitle_en || ''} onChange={(e) => update('subtitle_en', e.target.value)} />
          </div>
        </div>

        {/* Video & Poster */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Video & Poster</h3>
          <div className="space-y-3">
            <Input
              label="Video URL (MP4)"
              value={hero.video_url || ''}
              onChange={(e) => update('video_url', e.target.value)}
              placeholder="https://... (arkaplan videosu)"
            />
            <Input
              label="Poster / Thumbnail URL"
              value={hero.image_url || ''}
              onChange={(e) => update('image_url', e.target.value)}
              placeholder="https://... (video yüklenene kadar görünecek görsel)"
            />
          </div>
        </div>

        {/* Arka Plan Görseli */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Arka Plan Görseli</h3>
          <p className="text-xs text-muted mb-3">Video olmadığında veya yavaş bağlantılarda gösterilecek statik arka plan görseli.</p>

          {/* Önizleme */}
          {hero.background_image && (
            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3">
              <img
                src={hero.background_image}
                alt="Arka plan önizleme"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                <span className="text-white text-xs bg-black/50 px-2 py-1 rounded-lg">Hero Arka Planı</span>
              </div>
              <button
                type="button"
                onClick={() => update('background_image', '')}
                className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/60 text-white rounded-lg hover:bg-black/80"
              >
                Kaldır
              </button>
            </div>
          )}

          {!hero.background_image && (
            <div className="w-full h-32 rounded-xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 mb-3 text-muted">
              <ImageIcon className="w-8 h-8 opacity-40" />
              <p className="text-xs">Arka plan görseli seçilmedi</p>
            </div>
          )}

          <Input
            label="Arka Plan Görsel URL"
            value={hero.background_image || ''}
            onChange={(e) => update('background_image', e.target.value)}
            placeholder="https://... veya aşağıdan yükle"
          />

          <div className="mt-3">
            <input
              type="file"
              id="hero-bg-upload"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleBgUpload}
              disabled={uploadingBg}
              className="hidden"
            />
            <label
              htmlFor="hero-bg-upload"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors ${uploadingBg ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="w-4 h-4" />
              {uploadingBg ? 'Yükleniyor...' : 'Dosyadan Yükle (JPEG/PNG/WebP, maks. 10 MB)'}
            </label>
          </div>
        </div>

        {/* CTA Butonları */}
        <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Aksiyon Butonları (CTA)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="CTA Primary (TR)" value={hero.cta_primary_tr || ''} onChange={(e) => update('cta_primary_tr', e.target.value)} />
            <Input label="CTA Primary (EN)" value={hero.cta_primary_en || ''} onChange={(e) => update('cta_primary_en', e.target.value)} />
            <Input label="CTA Secondary (TR)" value={hero.cta_secondary_tr || ''} onChange={(e) => update('cta_secondary_tr', e.target.value)} />
            <Input label="CTA Secondary (EN)" value={hero.cta_secondary_en || ''} onChange={(e) => update('cta_secondary_en', e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? t('admin.saving') : t('admin.save')}
        </Button>
      </Card>
    </div>
  )
}
