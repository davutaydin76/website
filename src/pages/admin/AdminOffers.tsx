import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
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
  const [fileLinks, setFileLinks] = useState<string[]>([])
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
    Promise.all(selected.file_urls.map(getFileUrl))
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

  const statusColors: Record<Offer['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.offers')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            ))
          ) : offers.length === 0 ? (
            <p className="text-muted text-center py-12">Henüz teklif yok</p>
          ) : (
            offers.map((offer) => (
              <Card
                key={offer.id}
                className={`cursor-pointer transition-colors ${selected?.id === offer.id ? 'ring-2 ring-accent' : ''}`}
                onClick={() => setSelected(offer)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{offer.full_name}</p>
                    <p className="text-sm text-muted">{offer.company || '-'}</p>
                    <p className="text-xs text-muted mt-1">
                      {offer.created_at ? new Date(offer.created_at).toLocaleDateString('tr-TR') : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[offer.status] || ''}`}>
                    {t(`admin.${offer.status}`)}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>

        {selected && (
          <Card className="sticky top-6">
            <h3 className="font-semibold text-lg mb-4">{selected.full_name}</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-muted">Firma</dt><dd className="font-medium">{selected.company || '-'}</dd></div>
              <div><dt className="text-muted">Telefon</dt><dd className="font-medium">{selected.phone || '-'}</dd></div>
              <div><dt className="text-muted">E-posta</dt><dd className="font-medium">{selected.email || '-'}</dd></div>
              <div><dt className="text-muted">Açıklama</dt><dd className="font-medium whitespace-pre-wrap">{selected.description || '-'}</dd></div>
            </dl>

            {selected.file_urls && selected.file_urls.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-muted mb-2">Dosyalar</p>
                <div className="space-y-2">
                  {fileLinks.length > 0 ? (
                    fileLinks.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Dosya {i + 1}
                      </a>
                    ))
                  ) : (
                    <p className="text-xs text-muted">Dosya bağlantıları yükleniyor...</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-6">
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
          </Card>
        )}
      </div>
    </div>
  )
}
