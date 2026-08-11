import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Lock, ShieldAlert } from 'lucide-react'
import SEO from '@/components/seo/SEO'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})

type LoginForm = z.infer<typeof loginSchema>

// signInStatus → toast mesaj haritası
const STATUS_MESSAGES: Record<string, { title: string; message?: string }> = {
  not_admin: {
    title: 'Bu hesabın yönetici yetkisi bulunmamaktadır.',
    message: 'Yönetici erişimi için sistem yöneticisiyle iletişime geçin.',
  },
  inactive_admin: {
    title: 'Hesap devre dışı bırakılmıştır.',
    message: 'Hesabınızı etkinleştirmek için sistem yöneticisiyle iletişime geçin.',
  },
  error: {
    title: 'Bir hata oluştu.',
    message: 'Lütfen bir süre sonra tekrar deneyin.',
  },
}

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const { signIn, isAdmin, loading, signInStatus, clearSignInStatus } = useAuth()
  const { error: toastError } = useToast()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [inlineError, setInlineError] = useState('')
  const toastFiredRef = useRef(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // ─── Zaten giriş yapmış admin → /admin'e yönlendir (redirect döngüsü yok) ───
  // loading=true iken Navigate çalıştırmak ProtectedRoute ile sonsuz döngüye girer.
  // Bu nedenle yalnızca loading=false && isAdmin=true durumunda yönlendiriyoruz.
  useEffect(() => {
    if (!loading && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [loading, isAdmin, navigate])

  // ─── signInStatus değişince toast ve inline hata göster ─────────────────────
  useEffect(() => {
    if (submitting) return // Gönderim devam ederken tetiklenmesin

    const toastData = STATUS_MESSAGES[signInStatus]
    if (toastData && !toastFiredRef.current) {
      toastFiredRef.current = true
      toastError(toastData.title, toastData.message)
    }

    if (signInStatus === 'invalid_credentials') {
      setInlineError('E-posta veya şifre hatalı. Lütfen kontrol edin.')
    }

    return () => {
      // Cleanup: bir sonraki giriş denemesinde tekrar toast ateşlensin
    }
  }, [signInStatus, submitting, toastError])

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true)
    setInlineError('')
    toastFiredRef.current = false
    clearSignInStatus()

    const { error: authError } = await signIn(data.email, data.password)
    setSubmitting(false)

    if (!authError) {
      // Başarılı giriş — useEffect içindeki isAdmin=true watchi yönlendirir
      return
    }

    // invalid_credentials useEffect üzerinden yakalanır; diğerleri toast ile gösterilir
    if (signInStatus === 'invalid_credentials' || authError.message.toLowerCase().includes('hatalı')) {
      setInlineError(authError.message)
    }
  }

  // Auth yükleniyor — boş ekran göster (ProtectedRoute ile uyumlu)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-surface-dark">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Admin zaten giriş yapmış — useEffect yönlendiriyor, geçici boş render
  if (isAdmin) return null

  return (
    <>
      <SEO noindex title={`${t('admin.login')} | Aydın Torna CNC`} />

      <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-surface-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white dark:text-neutral-900" />
            </div>
            <h1 className="heading-md">{t('admin.login')}</h1>
            <p className="text-sm text-muted mt-2">Aydın Torna CNC — Yönetim Paneli</p>
          </div>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                id="admin-email"
                label={t('admin.email')}
                type="email"
                autoComplete="email"
                autoFocus
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                id="admin-password"
                label={t('admin.password')}
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />

              {/* Inline hata — kimlik bilgisi hatası için */}
              {inlineError && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50"
                >
                  <ShieldAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{inlineError}</p>
                </motion.div>
              )}

              <Button
                id="admin-login-submit"
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? t('common.loading') : t('admin.loginButton')}
              </Button>
            </form>
          </Card>

          <p className="text-center text-xs text-muted mt-6">
            Giriş sorunlarınız için sistem yöneticinizle iletişime geçin.
          </p>
        </motion.div>
      </div>
    </>
  )
}
