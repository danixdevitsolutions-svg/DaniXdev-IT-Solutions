'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  id,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'center' | 'start'
  id?: string
}) {
  const { lang } = useLanguage()
  const isUrdu = lang === 'ur'

  return (
    <div className={cn('flex flex-col gap-3', align === 'center' ? 'mx-auto max-w-2xl items-center text-center' : 'items-start')}>
      <span className="text-sm font-semibold tracking-wider text-primary uppercase">{eyebrow}</span>
      <h2
        id={id}
        className={cn(
          'font-bold text-balance text-navy',
          isUrdu ? 'text-3xl leading-[1.8] md:text-4xl md:leading-[1.8]' : 'text-3xl tracking-tight md:text-4xl',
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={cn('text-pretty text-muted-foreground', isUrdu ? 'text-base leading-loose' : 'text-lg leading-relaxed')}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
