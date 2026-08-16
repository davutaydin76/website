import { Routes, Route } from 'react-router-dom'
import { lazy } from 'react'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/admin/AdminLayout'
import ProtectedRoute from '@/components/admin/ProtectedRoute'

const HomePage = lazy(() => import('@/pages/HomePage'))
const GalleryPage = lazy(() => import('@/pages/GalleryPage'))
const DiaryPage = lazy(() => import('@/pages/DiaryPage'))
const OfferPage = lazy(() => import('@/pages/OfferPage'))
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminHero = lazy(() => import('@/pages/admin/AdminHero'))
const AdminServices = lazy(() => import('@/pages/admin/AdminServices'))
const AdminMachines = lazy(() => import('@/pages/admin/AdminMachines'))
const AdminGallery = lazy(() => import('@/pages/admin/AdminGallery'))
const AdminVideos = lazy(() => import('@/pages/admin/AdminVideos'))
const AdminClients = lazy(() => import('@/pages/admin/AdminClients'))
const AdminProjects = lazy(() => import('@/pages/admin/AdminProjects'))
const AdminOffers = lazy(() => import('@/pages/admin/AdminOffers'))
const AdminSeo = lazy(() => import('@/pages/admin/AdminSeo'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="diary" element={<DiaryPage />} />
        <Route path="projects" element={<DiaryPage />} />
        <Route path="offer" element={<OfferPage />} />
      </Route>

      <Route path="admin/login" element={<AdminLoginPage />} />

      <Route
        path="admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="hero" element={<AdminHero />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="machines" element={<AdminMachines />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="seo" element={<AdminSeo />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  )
}
