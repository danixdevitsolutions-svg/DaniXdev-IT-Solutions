import type { Metadata } from 'next'
import { PageCta } from '@/components/page-cta'
import { PageIntro } from '@/components/page-intro'
import { PricingSection } from '@/components/pricing-section'

export const metadata: Metadata = {
  title: 'Pricing | DaniXdev IT Solutions',
  description: 'View transparent starting prices for DaniXdev IT Solutions packages.',
}

export default function PricingPage() {
  return (
    <main>
      <PageIntro page="pricing" />
      <PricingSection />
      <PageCta />
    </main>
  )
}
