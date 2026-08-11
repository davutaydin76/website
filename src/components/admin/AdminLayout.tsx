import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Image, Wrench, Cog, Users, FileText,
  Search, Settings, LogOut, Video, Sparkles, Menu, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import SEO from '@/components/seo/SEO'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, labelKey: 'admin.dashboard', end: true },
  { to: '/admin/hero', icon: Sparkles, labelKey: 'admin.hero' },
  { to: '/admin/services', icon: Cog, labelKey: 'admin.services' },
  { to: '/admin/machines', icon: Wrench, labelKey: 'admin.machines' },
  { to: '/admin/gallery', icon: Image, labelKey: 'admin.gallery' },
  { to: '/admin/videos', icon: Video, labelKey: 'admin.videos' },
  { to: '/admin/clients', icon: Users, labelKey: 'admin.clients' },
  { to: '/admin/offers', icon: FileText, labelKey: 'admin.offers' },
  { to: '/admin/seo', icon: Search, labelKey: 'admin.seo' },
  { to: '/admin/settings', icon: Settings, labelKey: 'admin.settings' },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="flex flex-col h-full w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">Admin Panel</h2>
          <p className="text-xs text-muted mt-1">Aydın Torna CNC</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Menüyü kapat"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                  : 'text-muted hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {t('admin.logout')}
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <SEO noindex title="Admin Panel | Aydın Torna CNC" />
      <div className="min-h-screen flex bg-neutral-50 dark:bg-surface-dark">

        {/* Desktop sidebar — her zaman görünür */}
        <aside className="hidden lg:flex flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Arka plan overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              {/* Sidebar drawer */}
              <motion.aside
                initial={{ x: -264 }}
                animate={{ x: 0 }}
                exit={{ x: -264 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 left-0 z-50 flex lg:hidden"
              >
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Ana içerik */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Menüyü aç"
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="font-semibold text-sm">Admin Panel</span>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
