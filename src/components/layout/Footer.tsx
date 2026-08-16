import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white transition-colors">
      <div className="container-max mx-auto section-padding !py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.webp"
                alt="Aydın Torna CNC Logo"
                width={32}
                height={32}
                className="w-8 h-8 rounded-lg object-contain bg-transparent"
              />
              <span className="font-semibold text-lg text-zinc-900 dark:text-white">Aydın Torna CNC</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xs">{t('footer.description')}</p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-white">{t('nav.contact')}</h3>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-600 dark:text-accent" />
                <a href={`tel:${import.meta.env.VITE_COMPANY_PHONE}`} className="hover:text-accent transition-colors">
                  {import.meta.env.VITE_COMPANY_PHONE || '+90 262 XXX XX XX'}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-600 dark:text-accent" />
                <a href={`mailto:${import.meta.env.VITE_COMPANY_EMAIL}`} className="hover:text-accent transition-colors">
                  {import.meta.env.VITE_COMPANY_EMAIL || 'd.aydintorna@gmail.com'}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-600 dark:text-accent flex-shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Diliskelesi+Mh.+Cumhuriyet+Cd.+702.+Sk.+No:5+Dilovasi+Kocaeli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors leading-relaxed"
                >
                  Diliskelesi Mh. Cumhuriyet Cd. 702. Sk. No:5, Dilovası / Kocaeli
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-white">{t('nav.home')}</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
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
