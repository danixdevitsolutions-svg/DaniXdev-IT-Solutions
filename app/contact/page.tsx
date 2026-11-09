import type { Metadata } from 'next'
import { ContactSection } from '@/components/contact-section'
import { PageIntro } from '@/components/page-intro'

export const metadata: Metadata = {
  title: 'Contact | DaniXdev IT Solutions',
  description: 'Tell DaniXdev about your project and get in touch with the team.',
}

export default function ContactPage() {
  return (
    <main>
      <PageIntro page="contact" />
      <ContactSection />
    </main>
  )
}
