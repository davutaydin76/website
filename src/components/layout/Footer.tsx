import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
      <div className="container-max mx-auto section-padding !py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Aydın Torna CNC Logo"
                className="w-8 h-8 rounded-lg object-contain bg-black dark:bg-transparent"
              />
              <span className="font-semibold text-lg">Aydın Torna CNC</span>
            </div>
            <p className="text-sm text-muted max-w-xs">{t('footer.description')}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('nav.contact')}</h4>
            <ul className="space-y-3 text-sm text-muted">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <a href={`tel:${import.meta.env.VITE_COMPANY_PHONE}`} className="hover:text-accent transition-colors">
                  {import.meta.env.VITE_COMPANY_PHONE || '+90 262 XXX XX XX'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <a href={`mailto:${import.meta.env.VITE_COMPANY_EMAIL}`} className="hover:text-accent transition-colors">
                  {import.meta.env.VITE_COMPANY_EMAIL || 'info@aydintornacnc.com.tr'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Dilovası, Kocaeli</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t('nav.home')}</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link to="/" className="hover:text-accent transition-colors">{t('nav.home')}</Link></li>
              <li><Link to="/gallery" className="hover:text-accent transition-colors">{t('nav.gallery')}</Link></li>
              <li><Link to="/offer" className="hover:text-accent transition-colors">{t('nav.offer')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-muted">
          © {year} Aydın Torna CNC. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
