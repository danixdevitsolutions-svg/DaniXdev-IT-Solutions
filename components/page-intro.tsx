'use client'

import Link from 'next/link'
import type { PageKey } from '@/lib/site-content'
import { useLanguage } from './language-provider'

export function PageIntro({
  page,
}: {
  page: PageKey
}) {
  const { content, lang } = useLanguage()
  const { title, description } = content.pageIntros[page]

  return (
    <section className="bg-secondary/50 px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span aria-hidden="true" className="px-2">/</span>
          <span aria-current="page" className="font-medium text-navy">{title[lang]}</span>
        </nav>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-navy text-balance md:text-5xl">
          {title[lang]}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{description[lang]}</p>
      </div>
    </section>
  )
}
