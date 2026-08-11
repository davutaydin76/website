import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  variant?: 'default' | 'light'
}

export default function LanguageToggle({ variant = 'default' }: LanguageToggleProps) {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'tr' ? 'en' : 'tr'
    i18n.changeLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      className={cn(
        'px-3 py-1.5 text-sm font-medium rounded-full transition-colors',
        variant === 'light'
          ? 'border border-white/30 text-white hover:bg-white/10'
          : 'border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900'
      )}
    >
      {i18n.language.toUpperCase()}
    </button>
  )
}
