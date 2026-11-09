import { HeroSection } from '@/components/hero-section'
import { StatsSection } from '@/components/stats-section'
import { AboutSection } from '@/components/about-section'
import { ServicesSection } from '@/components/services-section'
import { TeamSection } from '@/components/team-section'
import { PricingSection } from '@/components/pricing-section'
import { ContactSection } from '@/components/contact-section'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <TeamSection />
      <PricingSection />
      <ContactSection />
    </main>
  )
}
