'use client'

import Link from 'next/link'
import { useLanguage } from './language-provider'

export function PageCta() {
  const { content, lang } = useLanguage()

  return (
    <section className="px-4 pb-20 md:px-6 md:pb-28">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-3xl bg-navy px-6 py-10 text-white md:flex-row md:items-center md:px-10">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">{content.pageCta.title[lang]}</h2>
          <p className="mt-2 text-white/75">{content.pageCta.description[lang]}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/contact" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy">
            {content.pageCta.contactLabel[lang]}
          </Link>
          <Link href="/pricing" className="inline-flex rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
            {content.pageCta.pricingLabel[lang]}
          </Link>
        </div>
      </div>
    </section>
  )
}
