import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Noto_Nastaliq_Urdu } from 'next/font/google'
import { LanguageProvider } from '@/components/language-provider'
import { SiteShell } from '@/components/site-shell'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ['arabic'], weight: ['400', '600', '700'], variable: '--font-nastaliq' })

export const metadata: Metadata = {
  title: 'DaniXdev IT Solutions | Web, App, Cloud & Cyber Security in Pakistan',
  description:
    'DaniXdev IT Solutions is a Pakistan-based IT company offering web development, mobile apps, UI/UX, software, digital marketing, ads, cloud, IT support and cyber security across Pakistan.',
  generator: 'v0.app',
  icons: {
    icon: '/images/logo-mark.png',
    apple: '/images/logo-mark.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${nastaliq.variable} bg-background`}>
      <body className="antialiased">
        <LanguageProvider>
          <SiteShell>{children}</SiteShell>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
