import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
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

export default function OfferForm({ compact = false }: OfferFormProps) {
  const { t } = useTranslation()
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
  })

  const onSubmit = async (data: OfferFormValues) => {
    setStatus('loading')
    const result = await submitOffer({ ...data, files })
    if (result.success) {
      setStatus('success')
      reset()
      setFiles([])
    } else {
      setStatus('error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  if (status === 'success') {
    return (
      <Card className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-lg font-medium">{t('offer.success')}</p>
        <Button variant="outline" className="mt-6" onClick={() => setStatus('idle')}>
          {t('offer.submit')}
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
            {...register('full_name')}
          />
          <Input label={t('offer.company')} {...register('company')} />
          <Input
            label={t('offer.phone')}
            type="tel"
            error={errors.phone ? t('validation.phone') : undefined}
            {...register('phone')}
          />
          <Input
            label={t('offer.email')}
            type="email"
            error={errors.email ? t('validation.email') : undefined}
            {...register('email')}
          />
        </div>

        <div className="mt-4">
          <Textarea label={t('offer.description')} {...register('description')} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
            {t('offer.files')}
          </label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl cursor-pointer hover:border-accent transition-colors">
            <Upload className="w-8 h-8 text-muted mb-2" />
            <span className="text-sm text-muted">{t('offer.filesHint')}</span>
            {files.length > 0 && (
              <span className="text-sm text-accent mt-1">{files.length} dosya seçildi</span>
            )}
            <input
              type="file"
              multiple
              accept={getAcceptedFileTypes()}
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            {t('offer.error')}
          </div>
        )}

        <Button
          type="submit"
          variant="secondary"
          size="lg"
          className="w-full mt-6"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? t('offer.submitting') : t('offer.submit')}
        </Button>
      </Card>
    </motion.form>
  )
}
