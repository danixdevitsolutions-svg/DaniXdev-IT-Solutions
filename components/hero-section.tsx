'use client'

import Image from 'next/image'
import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { useLanguage } from './language-provider'

export function HeroSection() {
  const { t, lang, content } = useLanguage()

  return (
    <section id="home" className="relative overflow-hidden">
      <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 end-[-10%] size-[520px] rounded-full bg-primary/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-20 md:px-6 md:pt-20 md:pb-28 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" aria-hidden="true" />
            {t.hero.badge}
          </span>

          <h1
            className={
              lang === 'ur'
                ? 'text-4xl leading-[1.8] font-bold text-navy md:text-5xl md:leading-[1.8]'
                : 'text-4xl leading-tight font-extrabold tracking-tight text-balance text-navy md:text-6xl md:leading-[1.08]'
            }
          >
            {t.hero.titleA} <span className="text-primary">{t.hero.titleB}</span>
          </h1>

          <p className={lang === 'ur' ? 'max-w-xl text-lg leading-loose text-muted-foreground' : 'max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground'}>
            {t.hero.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-navy"
            >
              {t.hero.primary}
              <ArrowRight className="size-4 rtl:rotate-180" aria-hidden="true" />
            </a>
            <a
              href="#services"
              className="inline-flex items-center rounded-full border border-border bg-background px-6 py-3.5 text-sm font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
            >
              {t.hero.secondary}
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-white to-secondary shadow-2xl shadow-navy/10">
            {content.heroImage?.url && (
              <Image
                src={content.heroImage.url}
                alt={`${content.brand.name} ${content.brand.descriptor}`}
                fill
                sizes="(min-width: 1024px) 560px, 90vw"
                className="object-contain p-8"
                priority
              />
            )}
          </div>
          <div className="absolute -bottom-6 start-4 flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-xl md:start-[-1.5rem]">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy">{t.hero.cardTitle}</p>
              <p className="text-xs text-muted-foreground">{t.hero.cardText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
