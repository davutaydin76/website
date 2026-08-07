import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollObjects from '@/components/scroll/ScrollObjects'

export default function Layout() {
  return (
    <div className="relative min-h-screen flex flex-col">
      <ScrollObjects />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
