import type { Metadata } from 'next'
import { AboutSection } from '@/components/about-section'
import { PageCta } from '@/components/page-cta'
import { PageIntro } from '@/components/page-intro'
import { StatsSection } from '@/components/stats-section'

export const metadata: Metadata = {
  title: 'About | DaniXdev IT Solutions',
  description: 'Learn about DaniXdev IT Solutions, a Pakistan-based technology company serving clients since 2023.',
}

export default function AboutPage() {
  return (
    <main>
      <PageIntro page="about" />
      <AboutSection />
      <StatsSection />
      <PageCta />
    </main>
  )
}
