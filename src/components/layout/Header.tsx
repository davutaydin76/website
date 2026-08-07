import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import Button from '@/components/ui/Button'

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMobileOpen(false), [location.pathname])

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/#services', label: t('nav.services') },
    { to: '/#machines', label: t('nav.machines') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/#contact', label: t('nav.contact') },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-accent" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Aydın <span className="text-accent">Torna</span> CNC
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            <Link to="/offer">
              <Button variant="secondary" size="sm">
                {t('nav.offer')}
              </Button>
            </Link>
          </div>

          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass border-t border-neutral-200/50 dark:border-neutral-800/50"
          >
            <nav className="container-max mx-auto px-4 py-4 flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 px-4 pt-2">
                <LanguageToggle />
                <Link to="/offer" className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full">
                    {t('nav.offer')}
                  </Button>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
