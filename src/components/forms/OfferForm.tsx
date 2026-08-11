import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Upload, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useToast } from '@/contexts/ToastContext'
import { submitOffer } from '@/services/offers'
import { getAcceptedFileTypes } from '@/lib/utils'

const offerSchema = z.object({
  full_name: z.string().min(2),
  company: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email(),
  description: z.string().optional(),
})

type OfferFormValues = z.infer<typeof offerSchema>

interface OfferFormProps {
  compact?: boolean
}

// 10 MB sınırı
const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function OfferForm({ compact = false }: OfferFormProps) {
  const { t } = useTranslation()
  const { success, error: toastError } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
  })

  const onSubmit = async (data: OfferFormValues) => {
    setSubmitting(true)
    const result = await submitOffer({ ...data, files })
    setSubmitting(false)

    if (result.success) {
      setSubmitted(true)
      reset()
      setFiles([])
      success(
        t('offer.successTitle') || 'Talebiniz alındı!',
        t('offer.successMessage') || 'En kısa sürede size dönüş yapacağız.'
      )
    } else {
      toastError(
        t('offer.errorTitle') || 'Gönderim başarısız',
        result.error || t('offer.error') || 'Lütfen tekrar deneyin.'
      )
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    if (!e.target.files) return

    const selected = Array.from(e.target.files)
    const oversized = selected.filter((f) => f.size > MAX_FILE_SIZE)

    if (oversized.length > 0) {
      setFileError(`Dosya boyutu 10 MB'ı aşamaz: ${oversized.map((f) => f.name).join(', ')}`)
      return
    }

    setFiles(selected)
  }

  if (submitted) {
    return (
      <Card className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">{t('offer.success')}</p>
        <p className="text-sm text-muted mt-2">{t('offer.successMessage')}</p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          {t('offer.newRequest') || 'Yeni Talep Oluştur'}
        </Button>
      </Card>
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <Card className={compact ? '' : 'max-w-2xl mx-auto'}>
        {!compact && (
          <div className="mb-8 text-center">
            <h2 className="heading-md mb-2">{t('offer.title')}</h2>
            <p className="text-muted">{t('offer.subtitle')}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={t('offer.fullName')}
            error={errors.full_name ? t('validation.required') : undefined}
            autoComplete="name"
            {...register('full_name')}
          />
          <Input
            label={t('offer.company')}
            autoComplete="organization"
            {...register('company')}
          />
          <Input
            label={t('offer.phone')}
            type="tel"
            autoComplete="tel"
            error={errors.phone ? t('validation.phone') : undefined}
            {...register('phone')}
          />
          <Input
            label={t('offer.email')}
            type="email"
            autoComplete="email"
            error={errors.email ? t('validation.email') : undefined}
            {...register('email')}
          />
        </div>

        <div className="mt-4">
          <Textarea label={t('offer.description')} {...register('description')} />
        </div>

        {/* Dosya yükleme alanı */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('offer.files')}
          </label>
          <label
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
              fileError
                ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-accent'
            }`}
          >
            <Upload className="w-8 h-8 text-muted mb-2" />
            <span className="text-sm text-muted">{t('offer.filesHint')}</span>
            <span className="text-xs text-muted mt-0.5">PDF, DWG, DXF, STEP — maks. 10 MB</span>
            {files.length > 0 && (
              <span className="text-sm text-accent mt-1 font-medium">
                {files.length} dosya seçildi
              </span>
            )}
            <input
              type="file"
              multiple
              accept={getAcceptedFileTypes()}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {fileError && (
            <p className="mt-1.5 text-xs text-red-500">{fileError}</p>
          )}
        </div>

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full mt-6"
          disabled={submitting || !!fileError}
        >
          {submitting ? t('offer.submitting') : t('offer.submit')}
        </Button>
      </Card>
    </motion.form>
  )
}
