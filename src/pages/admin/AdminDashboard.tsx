import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText, Image, Users, Wrench, Cog } from 'lucide-react'
import Card from '@/components/ui/Card'
import { fetchOffers, fetchServices, fetchMachines, fetchGallery, fetchClients } from '@/services/content'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [stats, setStats] = useState({
    offers: 0,
    pendingOffers: 0,
    services: 0,
    machines: 0,
    gallery: 0,
    clients: 0,
  })

  useEffect(() => {
    Promise.all([
      fetchOffers(),
      fetchServices(),
      fetchMachines(),
      fetchGallery(),
      fetchClients(),
    ]).then(([offers, services, machines, gallery, clients]) => {
      setStats({
        offers: offers.length,
        pendingOffers: offers.filter((o) => o.status === 'pending').length,
        services: services.length,
        machines: machines.length,
        gallery: gallery.length,
        clients: clients.length,
      })
    })
  }, [])

  const cards = [
    { label: t('admin.offers'), value: stats.offers, sub: `${stats.pendingOffers} ${t('admin.pending')}`, icon: FileText, color: 'text-accent' },
    { label: t('admin.services'), value: stats.services, icon: Cog, color: 'text-blue-500' },
    { label: t('admin.machines'), value: stats.machines, icon: Wrench, color: 'text-green-500' },
    { label: t('admin.gallery'), value: stats.gallery, icon: Image, color: 'text-purple-500' },
    { label: t('admin.clients'), value: stats.clients, icon: Users, color: 'text-orange-500' },
  ]

  return (
    <div>
      <h1 className="heading-md mb-8">{t('admin.dashboard')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.label}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
                {card.sub && <p className="text-xs text-muted mt-1">{card.sub}</p>}
              </div>
              <card.icon className={`w-8 h-8 ${card.color} opacity-60`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
