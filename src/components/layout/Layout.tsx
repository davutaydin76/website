import { useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollObjects from '@/components/scroll/ScrollObjects'
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp'

export default function Layout() {
  const location = useLocation()
  // Admin sayfalarında yüzen butonu gizle
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="relative min-h-screen flex flex-col">
      <ScrollObjects />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      {/* Yüzen WhatsApp Butonu — admin panelinde görünmez */}
      {!isAdmin && <FloatingWhatsApp />}
    </div>
  )
}
