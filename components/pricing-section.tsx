'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'
import { SectionHeading } from './section-heading'

export function PricingSection() {
  const { t, lang, content } = useLanguage()

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="bg-secondary/60 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <SectionHeading id="pricing-title" eyebrow={t.pricing.eyebrow} title={t.pricing.title} subtitle={t.pricing.subtitle} />

        <ul className="grid items-stretch gap-6 lg:grid-cols-3">
          {t.pricing.plans.map((plan, i) => {
            const planId = plan.id
            const featured = i === 1
            const isCustom = i === 2
            return (
              <li
                key={plan.name}
                className={cn(
                  'relative flex flex-col gap-6 rounded-3xl border p-8',
                  featured ? 'border-navy bg-navy text-white shadow-2xl shadow-navy/25 lg:-translate-y-3' : 'border-border bg-card',
                )}
              >
                {content.pricingPlanImages[planId]?.url && (
                  <div className="-mx-8 -mt-8 mb-1">
                    <div className="relative aspect-[16/9] overflow-hidden rounded-t-3xl bg-secondary">
                      <Image
                        src={content.pricingPlanImages[planId].url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 360px, 90vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                {featured && (
                  <span className="absolute -top-3.5 start-8 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    {t.pricing.popular}
                  </span>
                )}
                <div className="flex flex-col gap-2">
                  <h3 className={cn('text-xl font-bold', featured ? 'text-white' : 'text-navy')}>{plan.name}</h3>
                  <p className={cn('text-sm', featured ? 'text-white/75' : 'text-muted-foreground')}>{plan.desc}</p>
                </div>
                <div className="flex flex-col gap-1">
                  {!isCustom && (
                    <span className={cn('text-xs font-medium', featured ? 'text-white/70' : 'text-muted-foreground')}>{t.pricing.from}</span>
                  )}
                  <span
                    className={cn('text-4xl font-extrabold', featured ? 'text-white' : 'text-navy', !isCustom && 'font-sans')}
                    dir={isCustom ? undefined : 'ltr'}
                  >
                    {plan.price}
                  </span>
                </div>
                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className={cn('flex items-start gap-3 text-sm', lang === 'ur' && 'leading-loose')}>
                      <span
                        className={cn(
                          'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                          featured ? 'bg-primary text-white' : 'bg-primary/10 text-primary',
                        )}
                      >
                        <Check className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className={featured ? 'text-white/90' : 'text-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="/contact"
                  className={cn(
                    'inline-flex justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors',
                    featured ? 'bg-primary text-primary-foreground hover:bg-white hover:text-navy' : 'bg-navy text-white hover:bg-primary',
                  )}
                >
                  {t.pricing.choose}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
