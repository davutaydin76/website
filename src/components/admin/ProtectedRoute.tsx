import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Admin paneli sayfalarını korur.
 *
 * Olası durumlar:
 *  - loading=true           → Spinner göster (auth henüz başlatılıyor)
 *  - loading=false, isAdmin → İçeriği render et
 *  - loading=false, !isAdmin → /admin/login'e yönlendir (replace ile; geri tuşu döngü yaratmaz)
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth()

  // Auth durumu henüz bilinmiyor — Navigate erken çalıştırılırsa
  // AdminLoginPage'in isAdmin=false → /admin/login döngüsüne girilir.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-dark">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
