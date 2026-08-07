import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  const toggle = () => {
    const next = i18n.language === 'tr' ? 'en' : 'tr'
    i18n.changeLanguage(next)
  }

  return (
    <button
      onClick={toggle}
      className="px-3 py-1.5 text-sm font-medium rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
    >
      {i18n.language.toUpperCase()}
    </button>
  )
}
