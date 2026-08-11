import { useEffect, useState } from 'react'
import SEO from '@/components/seo/SEO'
import Hero from '@/components/home/Hero'
import Services from '@/components/home/Services'
import Machines from '@/components/home/Machines'
import Clients from '@/components/home/Clients'
import Counters from '@/components/home/Counters'
import GallerySection from '@/components/home/GallerySection'
import OfferForm from '@/components/forms/OfferForm'
import Contact from '@/components/home/Contact'
import {
  SkeletonCard,
  SkeletonMachineCard,
  SkeletonHero,
} from '@/components/ui/Skeleton'
import {
  fetchHero,
  fetchServices,
  fetchMachines,
  fetchClients,
  fetchCounters,
  fetchGallery,
  fetchVideos,
  fetchSeo,
  fetchContactSettings,
} from '@/services/content'
import type {
  HeroContent,
  Service,
  Machine,
  Client,
  CounterSettings,
  GalleryItem,
  VideoItem,
  SeoSettings,
  ContactSettings,
} from '@/types'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [counters, setCounters] = useState<CounterSettings | undefined>(undefined)
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [seo, setSeo] = useState<SeoSettings | null>(null)
  const [contact, setContact] = useState<ContactSettings | undefined>(undefined)

  useEffect(() => {
    Promise.all([
      fetchHero(),
      fetchServices(),
      fetchMachines(),
      fetchClients(),
      fetchCounters(),
      fetchGallery(),
      fetchVideos(),
      fetchSeo('home'),
      fetchContactSettings(),
    ])
      .then(([h, s, m, c, cnt, g, v, seoData, contactData]) => {
        setHero(h)
        setServices(s)
        setMachines(m)
        setClients(c)
        setCounters(cnt)
        setGallery(g)
        setVideos(v)
        setSeo(seoData)
        setContact(contactData)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO page="home" seo={seo} />

      {/* Hero — skeleton veya gerçek içerik */}
      {loading ? <SkeletonHero /> : <Hero content={hero} />}

      {/* Hizmetler */}
      {loading ? (
        <section className="section-padding">
          <div className="container-max mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <Services services={services} />
      )}

      {/* Makineler */}
      {loading ? (
        <section className="section-padding bg-neutral-50 dark:bg-neutral-950/50">
          <div className="container-max mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonMachineCard key={i} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <Machines machines={machines} />
      )}

      <Counters counters={counters} />
      <Clients clients={clients} />
      <GallerySection gallery={gallery} videos={videos} loading={loading} />

      <section className="section-padding">
        <div className="container-max mx-auto">
          <OfferForm />
        </div>
      </section>

      <Contact contact={contact} />
    </>
  )
}
