import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink, Trash2, Calendar, FileText, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchOffers, updateOfferStatus } from '@/services/content'
import { getFileUrl } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import type { Offer } from '@/types'

export default function AdminOffers() {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [offers, setOffers] = useState<Offer[]>([])
  const [selected, setSelected] = useState<Offer | null>(null)
  const [fileLinks, setFileLinks] = useState<{ name: string; url: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = async () => {
    try {
      const data = await fetchOffers()
      setOffers(data)
    } catch (err) {
      console.error('[AdminOffers] load error:', err)
      toastError('Teklifler yüklenemedi', 'Bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!selected?.file_urls?.length) {
      setFileLinks([])
      return
    }
    Promise.all(
      selected.file_urls.map(async (path) => {
        const url = await getFileUrl(path)
        const parts = path.split('/')
        const rawName = parts[parts.length - 1]
        const cleanName = rawName.replace(/^\d+-/, '') // Baştaki timestamp kısmını temizle
        return { name: cleanName, url }
      })
    )
      .then(setFileLinks)
      .catch((err) => {
        console.error('[AdminOffers] file link loading error:', err)
        toastError('Dosya bağlantıları alınamadı', 'Lütfen tekrar deneyin.')
      })
  }, [selected, toastError])

  const handleStatus = async (id: string, status: Offer['status']) => {
    setUpdating(true)
    try {
      const ok = await updateOfferStatus(id, status)
      if (!ok) throw new Error('Güncelleme başarısız.')
      success('Durum güncellendi', `Teklif durumu "${t(`admin.${status}`)}" olarak güncellendi.`)
      await load()
      if (selected?.id === id) {
        setSelected((prev) => prev ? { ...prev, status } : null)
      }
    } catch (err) {
      toastError('Güncelleme hatası', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Bu teklif talebini silmek istediğinize emin misiniz?')) return
    setUpdating(true)
    try {
      const { error } = await supabase.from('offers').delete().eq('id', id)
      if (error) throw error
      success('Teklif silindi', 'Teklif talebi başarıyla silindi.')
      setSelected(null)
      await load()
    } catch (err) {
      toastError('Silme hatası', err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  const statusColors: Record<Offer['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-md">{t('admin.offers')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Teklif listesi tablosu */}
        <div className={`lg:col-span-${selected ? '2' : '3'} transition-all duration-300`}>
          <Card className="p-0 overflow-hidden border border-neutral-200 dark:border-neutral-800">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />
                ))}
              </div>
            ) : offers.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>Henüz teklif talebi bulunmuyor.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 font-semibold">
                      <th className="p-4 whitespace-nowrap">Tarih</th>
                      <th className="p-4 whitespace-nowrap">Müşteri</th>
                      <th className="p-4 whitespace-nowrap">Telefon</th>
                      <th className="p-4 whitespace-nowrap">E-posta</th>
                      <th className="p-4 whitespace-nowrap">Durum</th>
                      <th className="p-4 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {offers.map((offer) => (
                      <tr
                        key={offer.id}
                        onClick={() => setSelected(offer)}
                        className={`cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors ${
                          selected?.id === offer.id ? 'bg-neutral-50 dark:bg-neutral-800/60 font-medium' : ''
                        }`}
                      >
                        <td className="p-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                          {offer.created_at ? new Date(offer.created_at).toLocaleDateString('tr-TR') : ''}
                        </td>
                        <td className="p-4 whitespace-nowrap font-medium text-neutral-900 dark:text-white">
                          {offer.full_name}
                          {offer.company && (
                            <span className="block text-xs text-muted font-normal">{offer.company}</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                          {offer.phone}
                        </td>
                        <td className="p-4 whitespace-nowrap text-neutral-600 dark:text-neutral-400">
                          {offer.email}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[offer.status] || ''}`}>
                            {t(`admin.${offer.status}`)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={(e) => handleDelete(offer.id, e)}
                            disabled={updating}
                            aria-label="Teklifi Sil"
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Teklif detay kartı */}
        {selected && (
          <Card className="sticky top-6 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">{selected.full_name}</h3>
                {selected.company && <p className="text-sm text-muted">{selected.company}</p>}
              </div>
              <button
                onClick={() => setSelected(null)}
                aria-label="Kapat"
                className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-xs text-muted">
                <Calendar className="w-4 h-4" />
                <span>Talep Tarihi: {selected.created_at ? new Date(selected.created_at).toLocaleString('tr-TR') : ''}</span>
              </div>

              <div className="grid grid-cols-1 gap-3 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl">
                <div>
                  <span className="block text-xs text-muted font-medium uppercase mb-0.5">Telefon</span>
                  <a href={`tel:${selected.phone}`} className="font-medium text-accent hover:underline">
                    {selected.phone}
                  </a>
                </div>
                <div>
                  <span className="block text-xs text-muted font-medium uppercase mb-0.5">E-posta</span>
                  <a href={`mailto:${selected.email}`} className="font-medium text-accent hover:underline">
                    {selected.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="block text-xs text-muted font-medium uppercase mb-1">Açıklama / Mesaj</span>
                <p className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl whitespace-pre-wrap leading-relaxed">
                  {selected.description || 'Açıklama belirtilmemiş.'}
                </p>
              </div>

              {selected.file_urls && selected.file_urls.length > 0 && (
                <div>
                  <span className="block text-xs text-muted font-medium uppercase mb-2">CAD / Tasarım Dosyaları</span>
                  <div className="space-y-2 bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl">
                    {fileLinks.length > 0 ? (
                      fileLinks.map((file, i) => (
                        <a
                          key={i}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-neutral-800 hover:ring-1 hover:ring-accent transition-all text-xs font-medium text-neutral-800 dark:text-neutral-200"
                        >
                          <span className="truncate flex-1 pr-2">{file.name}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        </a>
                      ))
                    ) : (
                      <p className="text-xs text-muted animate-pulse">Bağlantılar yükleniyor...</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-2">
              <span className="block text-xs text-muted font-medium uppercase mb-2">Durumu Güncelle</span>
              <div className="flex flex-wrap gap-1.5">
                {(['pending', 'reviewed', 'completed', 'rejected'] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selected.status === status ? 'secondary' : 'outline'}
                    onClick={() => handleStatus(selected.id, status)}
                    disabled={updating}
                  >
                    {t(`admin.${status}`)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
