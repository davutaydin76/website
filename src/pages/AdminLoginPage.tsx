import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import SEO from '@/components/seo/SEO'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

type LoginForm = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError('')
    const { error: authError } = await signIn(data.email, data.password)
    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      navigate('/admin')
    }
  }

  return (
    <>
      <SEO noindex title={`${t('admin.login')} | Aydın Torna CNC`} />

      <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-surface-dark">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-white dark:text-neutral-900" />
            </div>
            <h1 className="heading-md">{t('admin.login')}</h1>
          </div>

          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t('admin.email')}
                type="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('admin.password')}
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('admin.loginButton')}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  )
}
