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
  const [hero, setHero] = useState<HeroContent | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [counters, setCounters] = useState<CounterSettings>()
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [seo, setSeo] = useState<SeoSettings | null>(null)
  const [contact, setContact] = useState<ContactSettings>()

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
    ]).then(([h, s, m, c, cnt, g, v, seoData, contactData]) => {
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
  }, [])

  return (
    <>
      <SEO page="home" seo={seo} />
      <Hero content={hero} />
      <Services services={services} />
      <Machines machines={machines} />
      <Counters counters={counters} />
      <Clients clients={clients} />
      <GallerySection gallery={gallery} videos={videos} />
      <section className="section-padding">
        <div className="container-max mx-auto">
          <OfferForm />
        </div>
      </section>
      <Contact contact={contact} />
    </>
  )
}
