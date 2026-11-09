'use client'

import Image from 'next/image'
import { useLanguage } from './language-provider'

export function SiteFooter() {
  const { t, content, lang } = useLanguage()

  const links = [
    { href: '/about', label: t.nav.about },
    { href: '/services', label: t.nav.services },
    { href: '/team', label: t.nav.team },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/blog', label: t.nav.blog },
    { href: '/contact', label: t.nav.contact },
  ]

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:px-6 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white p-1.5">
              {content.brand.logo?.url && (
                <Image src={content.brand.logo.url} alt="" width={46} height={40} className="h-auto w-full" />
              )}
            </span>
            <span className="flex flex-col font-sans leading-none" dir="ltr">
              <span className="text-xl font-extrabold">{content.brand.name}</span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-white/70">{content.brand.descriptor}</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/70">{t.footer.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="mb-4 text-sm font-semibold">{t.footer.quick}</h2>
          <ul className="flex flex-col gap-2.5">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-white/70 transition-colors hover:text-white">{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 text-sm font-semibold">{t.footer.services}</h2>
          <ul className="flex flex-col gap-2.5">
            {content.homeServices.filter((service) => service.enabled).slice(0, 5).map((service) => (
              <li key={service.id} className="text-sm text-white/70">{service.title[lang]}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold">{t.footer.contact}</h2>
          <ul className="flex flex-col gap-2.5 font-sans text-sm" dir="ltr">
            <li>
              <a href={`tel:+${content.brand.phoneIntl}`} className="text-white/70 hover:text-white">{content.brand.phoneDisplay}</a>
            </li>
            <li>
              <a href={`mailto:${content.brand.email}`} className="break-all text-white/70 hover:text-white">{content.brand.email}</a>
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/50">{t.footer.social}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/60 md:px-6">
          <span dir="ltr" className="font-sans">{`© ${new Date().getFullYear()} DaniXdev IT Solutions.`}</span> {t.footer.rights}
        </p>
      </div>
    </footer>
  )
}
