'use client'

import Image from 'next/image'
import { Eye, Sparkles, Target } from 'lucide-react'
import { useLanguage } from './language-provider'
import { SectionHeading } from './section-heading'

export function AboutSection() {
  const { t, lang, content } = useLanguage()
  const body = lang === 'ur' ? 'leading-loose' : 'leading-relaxed'

  const cards = content.aboutCards

  return (
    <section id="about" aria-labelledby="about-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading id="about-title" align="start" eyebrow={t.about.eyebrow} title={t.about.title} />
          <p className={`text-lg text-muted-foreground ${body}`}>{t.about.text}</p>
        </div>

        <div className="grid gap-6">
          {cards.map((card) => {
            const Icon = card.icon === 'eye' ? Eye : card.icon === 'target' ? Target : Sparkles
            return (
            <article
              key={card.id}
              className="group rounded-3xl border border-border bg-card p-7 transition-shadow hover:shadow-xl hover:shadow-primary/10 md:p-8"
            >
              {card.image?.url && (
                <div className="relative mb-5 aspect-[16/7] overflow-hidden rounded-2xl bg-secondary">
                  <Image src={card.image.url} alt="" fill sizes="(min-width: 1024px) 500px, 90vw" className="object-cover" />
                </div>
              )}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-bold text-navy">{card.title[lang]}</h3>
              </div>
              <p className={`text-muted-foreground ${body}`}>{card.text[lang]}</p>
            </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
