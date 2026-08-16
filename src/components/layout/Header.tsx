import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NavLink {
  label: string
  to: string
  hash?: string
}

export default function Header() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [location.pathname])

  useEffect(() => setMobileOpen(false), [location.pathname])

  // Hash anchor click handler — SPA içinde smooth scroll
  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
      e.preventDefault()
      setMobileOpen(false)

      const [path, hash] = to.split('#')
      const targetPath = path || '/'

      if (hash) {
        if (location.pathname === targetPath || targetPath === '/') {
          // Aynı sayfadayken doğrudan scroll et
          const el = document.getElementById(hash)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        } else {
          // Farklı sayfadayken önce navige et, sonra scroll et
          navigate(targetPath)
          setTimeout(() => {
            const el = document.getElementById(hash)
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }, 300)
        }
      } else {
        navigate(targetPath)
      }
    },
    [location.pathname, navigate]
  )

  const links: NavLink[] = [
    { to: '/', label: t('nav.home') },
    { to: '/#services', label: t('nav.services') },
    { to: '/#machines', label: t('nav.machines') },
    { to: '/diary', label: t('nav.diary') },
    { to: '/gallery', label: t('nav.gallery') },
    { to: '/#contact', label: t('nav.contact') },
  ]

  const linkClass = (isTransparentMode: boolean) =>
    cn(
      'text-sm font-medium transition-colors',
      isTransparentMode
        ? 'text-white/80 hover:text-white'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
    )

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isTransparent ? 'bg-transparent' : 'glass shadow-sm'
      )}
    >
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.webp"
              alt="Aydın Torna CNC Logo"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain bg-transparent"
            />
            <span
              className={cn(
                'font-semibold text-lg tracking-tight',
                isTransparent ? 'text-white' : 'text-neutral-900 dark:text-white'
              )}
            >
              Aydın <span className="text-accent">Torna</span> CNC
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleAnchorClick(e, link.to)}
                className={linkClass(isTransparent)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageToggle variant={isTransparent ? 'light' : 'default'} />
            <ThemeToggle variant={isTransparent ? 'light' : 'default'} />
            <Link to="/offer">
              <Button variant="secondary" size="sm">
                {t('nav.offer')}
              </Button>
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle variant={isTransparent ? 'light' : 'default'} />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={mobileOpen}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isTransparent
                  ? 'text-white hover:bg-white/10'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
              )}
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden glass border-t border-neutral-200/50 dark:border-neutral-800/50"
          >
            <nav className="container-max mx-auto px-4 py-4 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleAnchorClick(e, link.to)}
                  className="px-4 py-3 rounded-xl text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex items-center gap-3 px-4 pt-2 border-t border-neutral-200/50 dark:border-neutral-800/50 mt-2">
                <LanguageToggle />
                <Link to="/offer" className="flex-1" onClick={() => setMobileOpen(false)}>
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
