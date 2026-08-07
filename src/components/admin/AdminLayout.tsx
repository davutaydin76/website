import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Image, Wrench, Cog, Users, FileText,
  Search, Settings, LogOut, Video, Sparkles,
} from 'lucide-react'
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

export default function AdminLayout() {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <>
      <SEO noindex title="Admin Panel | Aydın Torna CNC" />
      <div className="min-h-screen flex bg-neutral-50 dark:bg-surface-dark">
        <aside className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <h1 className="font-semibold text-lg">Admin Panel</h1>
            <p className="text-xs text-muted mt-1">Aydın Torna CNC</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-muted hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('admin.logout')}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8 max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  )
}
