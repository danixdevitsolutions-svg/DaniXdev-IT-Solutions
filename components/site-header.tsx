'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLanguage } from './language-provider'
import { LanguageToggle } from './language-toggle'

export function SiteHeader() {
  const { t, content } = useLanguage()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/about', label: t.nav.about },
    { href: '/services', label: t.nav.services },
    { href: '/team', label: t.nav.team },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/blog', label: t.nav.blog },
    { href: '/contact', label: t.nav.contact },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="DaniXdev IT Solutions home">
          {content.brand.logo?.url && (
            <Image src={content.brand.logo.url} alt="" width={46} height={40} className="h-9 w-auto md:h-10" priority />
          )}
          <span className="flex flex-col font-sans leading-none" dir="ltr">
            <span className="text-lg font-extrabold tracking-tight text-navy md:text-xl">
              {content.brand.name}
            </span>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground">{content.brand.descriptor}</span>
          </span>
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-navy"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle className="hidden sm:inline-flex" />
          <a
            href="/contact"
            className="hidden rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary md:inline-flex"
          >
            {t.nav.cta}
          </a>
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-full border border-border text-navy lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-secondary"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="pt-3 sm:hidden">
              <LanguageToggle />
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
