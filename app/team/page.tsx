import type { Metadata } from 'next'
import { PageCta } from '@/components/page-cta'
import { PageIntro } from '@/components/page-intro'
import { TeamSection } from '@/components/team-section'

export const metadata: Metadata = {
  title: 'Team | DaniXdev IT Solutions',
  description: 'Meet the experienced professionals behind DaniXdev IT Solutions.',
}

export default function TeamPage() {
  return (
    <main>
      <PageIntro page="team" />
      <TeamSection showFounderMessage />
      <PageCta />
    </main>
  )
}
