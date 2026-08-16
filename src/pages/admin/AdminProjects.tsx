/**
 * AdminProjects.tsx — Üretim Günlüğü Proje Yönetimi
 *
 * Özellikler:
 * - completion_date ile kronolojik sıralama (Google Fotoğraflar tarihi)
 * - Multi-image/video upload (Supabase Storage)
 * - Otomatik İngilizce çeviri (LibreTranslate ücretsiz API)
 * - NDA / gizlilik uyarısı (müşteri ismi yasaklı)
 * - Teknik çeviri uyarısı (sanayi terimleri elle kontrol edilmeli)
 * - is_active default: false — incelenmeden yayınlanmaz
 */

import { useEffect, useState, useId, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus, Trash2, Pencil, ImageOff, Save, X, Languages,
  Loader2, AlertTriangle, Eye, EyeOff, CalendarDays,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { fetchAllProjects } from '@/services/content'
import type { ProjectData } from '@/types'

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const ALLOWED_IMAGE = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime']
const ALLOWED_TYPES = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB (eski yüksek-res fotoğraflar için)

// LibreTranslate public instance — ücretsiz, kayıt gerektirmez
const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate'

type EditableProject = Partial<ProjectData>

const emptyProject: EditableProject = {
  completion_date: new Date().toISOString().split('T')[0],
  title_tr: '',
  title_en: '',
  specs_tr: '',
  specs_en: '',
  description_tr: '',
  description_en: '',
  client_type_tr: '',
  client_type_en: '',
  processing_time: '',
  media_urls: [],
  cover_image_url: '',
  is_active: false, // Default: KAPALI — incelenmeden yayınlanmaz
  sort_order: 0,
  meta_keywords: '',
}

// ─── Otomatik Çeviri (Güvenlik Katmanlı & Çoklu Sağlayıcı) ───────────────────
async function translateText(text: string, target: 'en' | 'tr' = 'en'): Promise<string> {
  const cleanText = text.trim()
  if (!cleanText) return ''

  // 1. Birincil: MyMemory API (Hızlı, ücretsiz, auth gerektirmez, 400 atmaz)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)
    const langPair = target === 'en' ? 'tr|en' : 'en|tr'
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanText.slice(0, 500))}&langpair=${langPair}`

    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data?.responseData?.translatedText && !data.responseData.translatedText.startsWith('MYMEMORY WARNING')) {
        return data.responseData.translatedText
      }
    }
  } catch {
    // MyMemory zaman aşımına uğrarsa sonraki sağlayıcıya geç
  }

  // 2. İkincil: LibreTranslate (Yedek)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 4000)

    const res = await fetch(LIBRE_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        q: cleanText,
        source: target === 'en' ? 'tr' : 'en',
        target,
        format: 'text',
      }),
      signal: controller.signal,
    })
    clearTimeout(timeoutId)

    if (res.ok) {
      const data = await res.json()
      if (data?.translatedText) {
        return data.translatedText
      }
    }
  } catch {
    // Güvenli hata yakalama — konsola 400 basmadan sessizce boş döner
  }

  return ''
}

// ─── Yardımcı: Video mu? ──────────────────────────────────────────────────────
function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url)
}

// ─── Tarih Formatı ────────────────────────────────────────────────────────────
function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`
}

// ─── Bileşen ──────────────────────────────────────────────────────────────────
export default function AdminProjects() {
  const { t } = useTranslation()
  const { success, error: toastError, warning } = useToast()
  const [items, setItems] = useState<ProjectData[]>([])
  const [editing, setEditing] = useState<EditableProject | null>(null)
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [translating, setTranslating] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const coverInputId = useId()
  const mediaInputId = useId()

  // ─── Veri Yükleme ───────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    const data = await fetchAllProjects()
    setItems(data)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // ─── Kaydet ─────────────────────────────────────────────────────────────────
  const save = async () => {
    if (!editing) return
    if (!editing.title_tr?.trim()) {
      warning('Eksik alan', 'Türkçe başlık zorunludur.')
      return
    }
    try {
      const payload: EditableProject = {
        ...editing,
        completion_date: editing.completion_date || new Date().toISOString(),
      }
      const { error } = editing.id
        ? await supabase.from('projects').update(payload).eq('id', editing.id)
        : await supabase.from('projects').insert(payload)
      if (error) throw error
      success(t('admin.saved'))
      setEditing(null)
      load()
    } catch (err) {
      toastError('Kayıt başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  // ─── Sil ────────────────────────────────────────────────────────────────────
  const remove = async (id: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
      success('Proje silindi.')
      load()
    } catch (err) {
      toastError('Silme başarısız', err instanceof Error ? err.message : 'Hata oluştu')
    }
  }

  // ─── Aktif / Pasif Toggle ────────────────────────────────────────────────────
  const toggleActive = async (item: ProjectData) => {
    const { error } = await supabase
      .from('projects')
      .update({ is_active: !item.is_active })
      .eq('id', item.id)
    if (error) toastError('Güncelleme hatası', error.message)
    else {
      success(item.is_active ? 'Pasife alındı.' : 'Yayınlandı!')
      load()
    }
  }

  // ─── Kapak Görseli Yükle ────────────────────────────────────────────────────
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ALLOWED_TYPES.includes(file.type)) { toastError('Format hatası', 'JPG, PNG, WebP veya MP4 yükleyin.'); return }
    if (file.size > MAX_FILE_SIZE) { toastError('Dosya çok büyük', 'Maks. 50 MB.'); return }
    setUploadingFiles(true)
    const path = `projects/covers/${Date.now()}-${file.name.replace(/\s+/g, '_')}`
    const url = await uploadFile('gallery', path, file)
    setUploadingFiles(false)
    if (url) {
      setEditing((p) => ({ ...p, cover_image_url: url }))
      success('Kapak görseli yüklendi.')
    } else {
      toastError('Yükleme başarısız', 'Supabase Storage hatası.')
    }
  }

  // ─── Multi Medya Yükle (fotoğraf + video) ───────────────────────────────────
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const invalid = files.filter((f) => !ALLOWED_TYPES.includes(f.type))
    if (invalid.length) { toastError('Desteklenmeyen format', invalid.map((f) => f.name).join(', ')); return }
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length) { toastError('Dosya çok büyük', `Maks. 50 MB: ${oversized.map((f) => f.name).join(', ')}`); return }

    setUploadingFiles(true)
    const uploaded: string[] = []
    for (const file of files) {
      const path = `projects/media/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/\s+/g, '_')}`
      const url = await uploadFile('gallery', path, file)
      if (url) uploaded.push(url)
    }
    setUploadingFiles(false)
    if (uploaded.length) {
      setEditing((p) => ({ ...p, media_urls: [...(p?.media_urls || []), ...uploaded] }))
      success(`${uploaded.length} medya yüklendi.`)
    }
  }

  // ─── Medyadan Kaldır ────────────────────────────────────────────────────────
  const removeMedia = (url: string) => {
    setEditing((p) => ({ ...p, media_urls: (p?.media_urls || []).filter((u) => u !== url) }))
  }

  // ─── Otomatik Çeviri ────────────────────────────────────────────────────────
  const translate = async (field: 'title' | 'specs' | 'description' | 'client_type') => {
    const trText = editing?.[`${field}_tr` as keyof EditableProject] as string | undefined
    if (!trText?.trim()) { warning('Boş alan', 'Türkçe metin giriniz.'); return }
    setTranslating((p) => ({ ...p, [field]: true }))
    const en = await translateText(trText, 'en')
    setTranslating((p) => ({ ...p, [field]: false }))
    if (en) {
      setEditing((p) => ({ ...p, [`${field}_en`]: en }))
      success('Çeviri tamamlandı — teknik terimleri kontrol edin!')
    } else {
      toastError('Çeviri başarısız', 'LibreTranslate erişilemiyor. Lütfen elle doldurun.')
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Üretim Günlüğü Projeleri</h1>
          <p className="text-sm text-muted mt-1">
            Case study / proje kartları — <span className="text-amber-500 font-medium">is_active: false</span> → incelenmeden yayınlanmaz
          </p>
        </div>
        <Button onClick={() => setEditing({ ...emptyProject })} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Yeni Proje
        </Button>
      </div>

      {/* ─── DÜZENLEME FORMU ─────────────────────────────────────────────── */}
      {editing && (
        <Card className="border-2 border-accent/30 bg-accent/5 space-y-6">
          {/* Form Başlığı */}
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">{editing.id ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}</h2>
            <button onClick={() => setEditing(null)} aria-label="Formu kapat" className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── NDA UYARISI ── */}
          <div className="flex gap-2.5 items-start p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>⚠️ Gizlilik / NDA:</strong> Müşteri ismini <strong>asla</strong> yazmayın. Bunun yerine sektörel genel tanımlar kullanın:{' '}
              <em>"Tuzla'da bir tersane"</em>, <em>"Enerji santrali müteahhidi"</em>, <em>"Kocaeli otomotiv tedarikçisi"</em>.
            </p>
          </div>

          {/* ── TAMAMLANMA TARİHİ ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="proj-completion-date" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                <CalendarDays className="w-3.5 h-3.5 inline mr-1" />
                Tamamlanma Tarihi (Google Fotoğraflar)
              </label>
              <input
                id="proj-completion-date"
                type="date"
                value={editing.completion_date?.split('T')[0] || ''}
                onChange={(e) => setEditing((p) => ({ ...p, completion_date: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <Input
              id="proj-processing-time"
              label="İşlem Süresi (Teslim)"
              placeholder="3 iş günü / 2 hafta"
              value={editing.processing_time || ''}
              onChange={(e) => setEditing((p) => ({ ...p, processing_time: e.target.value }))}
            />
            <Input
              id="proj-sort"
              label="Sıra No"
              type="number"
              value={String(editing.sort_order ?? 0)}
              onChange={(e) => setEditing((p) => ({ ...p, sort_order: Number(e.target.value) }))}
            />
          </div>

          {/* ── BAŞLIKLAR ── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">📌 Başlık</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="proj-title-tr" label="Başlık (TR) *" placeholder="6 Metre Gemi Şaftı Revizyonu"
                value={editing.title_tr || ''} onChange={(e) => setEditing((p) => ({ ...p, title_tr: e.target.value }))} />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="proj-title-en" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Title (EN)</label>
                  <TranslateButton loading={translating['title']} onClick={() => translate('title')} />
                </div>
                <input id="proj-title-en" value={editing.title_en || ''}
                  onChange={(e) => setEditing((p) => ({ ...p, title_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                <TranslationWarning />
              </div>
            </div>
          </div>

          {/* ── TEKNİK ÖZETLER (SPECS) ── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">⚙️ Teknik Özellikler (Pill'ler)</h3>
            <p className="text-xs text-muted mb-3">Birden fazla özelliği <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">·</code> ile ayırın. Örn: <em>Ø1200mm · 4140 Çelik · ±0.02mm · 7500mm boy</em></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="proj-specs-tr" label="Teknik Özet (TR)"
                placeholder="Ø240mm · AISI 4340 · Ra 0.8µm · ±0.02mm"
                value={editing.specs_tr || ''} onChange={(e) => setEditing((p) => ({ ...p, specs_tr: e.target.value }))} />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="proj-specs-en" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Tech Specs (EN)</label>
                  <TranslateButton loading={translating['specs']} onClick={() => translate('specs')} />
                </div>
                <input id="proj-specs-en" value={editing.specs_en || ''}
                  onChange={(e) => setEditing((p) => ({ ...p, specs_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                <TranslationWarning />
              </div>
            </div>
          </div>

          {/* ── AÇIKLAMA ── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">📖 Proje Hikayesi / Açıklama</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea id="proj-desc-tr" label="Açıklama (TR)"
                value={editing.description_tr || ''} onChange={(e) => setEditing((p) => ({ ...p, description_tr: e.target.value }))} />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="proj-desc-en" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Description (EN)</label>
                  <TranslateButton loading={translating['description']} onClick={() => translate('description')} />
                </div>
                <textarea id="proj-desc-en" value={editing.description_en || ''}
                  onChange={(e) => setEditing((p) => ({ ...p, description_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none min-h-[120px]" />
                <TranslationWarning />
              </div>
            </div>
          </div>

          {/* ── MÜŞTERİ TÜRÜ (NDA uyumlu) ── */}
          <div>
            <h3 className="text-sm font-semibold mb-1 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">🏭 Müşteri / Sektör Tanımı (İsim Yok!)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="proj-client-tr" label="Sektör Tanımı (TR)"
                placeholder="Tuzla'da bir tersane / Kocaeli enerji firması"
                value={editing.client_type_tr || ''} onChange={(e) => setEditing((p) => ({ ...p, client_type_tr: e.target.value }))} />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="proj-client-en" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Client Type (EN)</label>
                  <TranslateButton loading={translating['client_type']} onClick={() => translate('client_type')} />
                </div>
                <input id="proj-client-en" value={editing.client_type_en || ''}
                  onChange={(e) => setEditing((p) => ({ ...p, client_type_en: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
                <TranslationWarning />
              </div>
            </div>
          </div>

          {/* ── SEO KEYWORDS ── */}
          <Input id="proj-keywords" label="Meta Keywords (SEO — virgülle ayır)"
            placeholder="gemi şaftı torna, marine shaft machining, kocaeli cnc, 4140 çelik"
            value={editing.meta_keywords || ''} onChange={(e) => setEditing((p) => ({ ...p, meta_keywords: e.target.value }))} />

          {/* ── KAPAK GÖRSELİ ── */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">🖼 Kapak Görseli</h3>
            <div className="flex items-center gap-4 flex-wrap">
              {editing.cover_image_url && (
                <img src={editing.cover_image_url} alt="Kapak" className="w-28 h-20 object-cover rounded-xl border border-neutral-300 dark:border-neutral-700" />
              )}
              <label htmlFor={coverInputId}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-accent cursor-pointer transition-colors text-sm font-medium text-muted">
                {uploadingFiles ? <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor…</> : 'Kapak Seç (JPG/PNG/WebP)'}
                <input id={coverInputId} type="file" accept={ALLOWED_IMAGE.join(',')} onChange={handleCoverUpload} className="hidden" disabled={uploadingFiles} aria-label="Kapak görseli seç" />
              </label>
              {editing.cover_image_url && (
                <button type="button" onClick={() => setEditing((p) => ({ ...p, cover_image_url: '' }))} className="text-xs text-red-400 hover:text-red-500 transition-colors" aria-label="Kapak görselini kaldır">Kaldır</button>
              )}
            </div>
          </div>

          {/* ── ÇOKLU MEDYA YÜKLEME ── */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">📁 Proje Medyaları (Fotoğraf + Video)</h3>
            <p className="text-xs text-muted mb-3">JPG, PNG, WebP, MP4, WebM — maks. 50 MB/dosya. Binlerce eski fotoğraf için toplu seçim desteklenir.</p>
            <label htmlFor={mediaInputId}
              className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-accent rounded-xl cursor-pointer transition-colors text-sm font-medium text-muted">
              {uploadingFiles ? <><Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor…</> : '+ Medya Ekle (Çoklu Seçim Desteklenir)'}
              <input id={mediaInputId} type="file" accept={ALLOWED_TYPES.join(',')} multiple onChange={handleMediaUpload} className="hidden" disabled={uploadingFiles} aria-label="Proje medyası seç" />
            </label>

            {/* Medya Önizleme Grid */}
            {(editing.media_urls || []).length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mt-3">
                {(editing.media_urls || []).map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    {isVideoUrl(url) ? (
                      <video src={url} muted playsInline className="w-full h-full object-cover" aria-label={`Video ${i + 1}`} />
                    ) : (
                      <img src={url} alt={`Medya ${i + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    )}
                    <button
                      onClick={() => removeMedia(url)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Medya ${i + 1}'i kaldır`}
                    ><X className="w-3 h-3" /></button>
                    {isVideoUrl(url) && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">VIDEO</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── AKTİF TOGGLE ── */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <input id="proj-active" type="checkbox" checked={editing.is_active ?? false}
              onChange={(e) => setEditing((p) => ({ ...p, is_active: e.target.checked }))}
              className="w-4 h-4 accent-accent" aria-label="Projeyi yayınla" />
            <label htmlFor="proj-active" className="text-sm font-medium cursor-pointer">
              Yayınla (Ana sayfada göster)
            </label>
            <span className="ml-auto text-xs text-muted">Default: KAPALI — inceledikten sonra açın</span>
          </div>

          {/* ── KAYDET ── */}
          <div className="flex gap-3">
            <Button onClick={save} disabled={uploadingFiles} className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Kaydet
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>İptal</Button>
          </div>
        </Card>
      )}

      {/* ─── PROJE LİSTESİ ──────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-52 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <ImageOff className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">Henüz proje eklenmedi.{' '}
            <button onClick={() => setEditing({ ...emptyProject })} className="text-accent underline">İlk projeyi ekle</button>
          </p>
          <SqlGuide />
        </Card>
      ) : (
        <>
          <p className="text-xs text-muted">{items.length} proje — <span className="text-green-500">{items.filter(i => i.is_active).length} yayında</span>, <span className="text-amber-500">{items.filter(i => !i.is_active).length} taslak</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden relative group border-2 hover:border-accent/30 transition-colors">
                {/* Kapak */}
                <div className="w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-3 overflow-hidden">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.title_tr} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-400"><ImageOff className="w-8 h-8" /></div>
                  )}
                </div>

                {/* Rozet */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'}`}>
                    {item.is_active ? 'Yayında' : 'Taslak'}
                  </span>
                  {(item.media_urls?.length || 0) > 0 && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                      {item.media_urls.length} medya
                    </span>
                  )}
                </div>

                {/* Tarih */}
                {item.completion_date && (
                  <p className="text-xs text-accent font-medium mb-1 flex items-center gap-1">
                    <CalendarDays className="w-3 h-3" />{formatDate(item.completion_date)}
                  </p>
                )}

                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title_tr}</h3>
                {item.specs_tr && <p className="text-xs text-muted mb-2 line-clamp-1">{item.specs_tr}</p>}

                {/* Eylemler */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => setEditing(item)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-accent hover:text-white transition-colors" aria-label={`${item.title_tr} düzenle`}>
                    <Pencil className="w-3 h-3" /> Düzenle
                  </button>
                  <button onClick={() => toggleActive(item)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" aria-label={item.is_active ? 'Pasife al' : 'Yayınla'}>
                    {item.is_active ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {item.is_active ? 'Pasife Al' : 'Yayınla'}
                  </button>
                  <button onClick={() => remove(item.id)} className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" aria-label={`${item.title_tr} sil`}>
                    <Trash2 className="w-3 h-3" /> Sil
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* SQL Kurulum */}
      {!loading && <SqlGuide />}
    </div>
  )
}

// ─── Yardımcı Alt Bileşenler ─────────────────────────────────────────────────

function TranslateButton({ loading, onClick }: { loading?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
      aria-label="Otomatik İngilizceye çevir"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
      {loading ? 'Çevriliyor…' : 'Otomatik Çevir'}
    </button>
  )
}

function TranslationWarning() {
  return (
    <div className="flex gap-1.5 items-start mt-1.5 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
      <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
      <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight">
        ⚠️ Otomatik çeviri <strong>fener mili, kater, tolerans</strong> gibi teknik sanayi terimlerini hatalı çevirebilir. Yayınlamadan önce elle kontrol edin.
      </p>
    </div>
  )
}

function SqlGuide() {
  return (
    <Card className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 mt-6">
      <h3 className="font-semibold text-sm text-blue-700 dark:text-blue-400 mb-2">📋 Supabase — `projects` Tablo SQL (Güncellenmiş Şema)</h3>
      <p className="text-xs text-blue-600 dark:text-blue-500 mb-3">Supabase SQL Editor'de bir kez çalıştırın:</p>
      <pre className="text-xs bg-neutral-900 text-green-400 p-4 rounded-xl overflow-x-auto leading-relaxed whitespace-pre">
{`CREATE TABLE IF NOT EXISTS public.projects (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at       timestamptz DEFAULT now() NOT NULL,
  completion_date  timestamptz,                    -- Google Fotoğraflar tarihi
  title_tr         text NOT NULL,
  title_en         text NOT NULL DEFAULT '',
  specs_tr         text,
  specs_en         text,
  description_tr   text,
  description_en   text,
  client_type_tr   text,                           -- "Tuzla'da bir tersane"
  client_type_en   text,                           -- "A shipyard in Tuzla"
  processing_time  text,                           -- "3 iş günü"
  media_urls       text[] DEFAULT '{}',
  cover_image_url  text,
  is_active        boolean DEFAULT false,           -- incelenmeden yayınlanmaz
  sort_order       integer DEFAULT 0,
  meta_keywords    text
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active" ON public.projects
  FOR SELECT USING (is_active = true);

CREATE POLICY "Auth all" ON public.projects
  FOR ALL USING (auth.role() = 'authenticated');`}
      </pre>
    </Card>
  )
}
