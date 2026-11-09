import type { Metadata } from 'next'
import { PageCta } from '@/components/page-cta'
import { PageIntro } from '@/components/page-intro'
import { ServicesPageSection } from '@/components/services-page-section'

export const metadata: Metadata = {
  title: 'Services | DaniXdev IT Solutions',
  description: 'Explore web, mobile app, software, marketing, design and IT service packages from DaniXdev.',
}

export default function ServicesPage() {
  return (
    <main>
      <PageIntro page="services" />
      <ServicesPageSection />
      <PageCta />
    </main>
  )
}
