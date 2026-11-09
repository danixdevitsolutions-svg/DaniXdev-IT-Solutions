'use client'

import Image from 'next/image'
import { Crown } from 'lucide-react'
import { useLanguage } from './language-provider'
import { SectionHeading } from './section-heading'

export function TeamSection({ showFounderMessage = false }: { showFounderMessage?: boolean }) {
  const { t, content, lang } = useLanguage()
  const members = showFounderMessage
    ? content.teamMembers.filter((member) => member.id !== 'founder')
    : content.teamMembers
  const founder = content.teamMembers.find((member) => member.id === 'founder')
  const paragraphs = content.founderMessage.paragraphs[lang]

  return (
    <section id="team" aria-labelledby="team-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        {showFounderMessage && content.founderMessage.enabled && (
          <article className="grid overflow-hidden rounded-3xl border border-border bg-card shadow-sm md:grid-cols-[0.8fr_1.2fr]">
            <div className="relative min-h-80 bg-gradient-to-br from-secondary to-primary/15 md:min-h-[34rem]">
              {content.founderMessage.image?.url && (
                <Image
                  src={content.founderMessage.image.url}
                  alt={`${founder?.name[lang] ?? 'Daniyal Burfat'}, Founder and CEO of DaniXdev IT Solutions`}
                  fill
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="object-cover object-top"
                  priority
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-7 md:p-10 lg:p-14" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
              <span className="text-sm font-semibold tracking-wider text-primary uppercase">Founder &amp; CEO</span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-navy md:text-4xl">
                {content.founderMessage.heading[lang]}
              </h2>
              <div className={`mt-6 space-y-4 text-base text-muted-foreground md:text-lg ${lang === 'ur' ? 'leading-loose' : 'leading-relaxed'}`}>
                {paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph}`} className={index === paragraphs.length - 1 ? 'font-semibold text-navy' : undefined}>
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="mt-7 font-semibold text-navy">{founder?.name[lang] ?? 'Daniyal Burfat'}</p>
              <p className="text-sm text-muted-foreground">Founder &amp; CEO, DaniXdev IT Solutions</p>
            </div>
          </article>
        )}
        <SectionHeading id="team-title" eyebrow={t.team.eyebrow} title={t.team.title} subtitle={t.team.subtitle} />

        <ul className={`grid gap-6 sm:grid-cols-2 ${showFounderMessage ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {members.map((member) => {
            const isCeo = member.id === 'founder'
            const initials = member.name[lang].split(/\s+/).map((part) => part[0]).join('').slice(0, 2)
            return (
              <li
                key={member.id}
                className={`flex flex-col overflow-hidden rounded-3xl border bg-card transition-shadow hover:shadow-xl hover:shadow-primary/10 ${
                  isCeo ? 'border-primary/40 ring-2 ring-primary/15' : 'border-border'
                }`}
              >
                <div className="relative aspect-[4/5] bg-gradient-to-br from-secondary to-primary/15">
                  {member.image?.url ? (
                    <Image
                      src={member.image.url}
                      alt={`${member.name[lang]}, ${member.role[lang]}`}
                      fill
                      sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span
                        aria-hidden="true"
                        dir="ltr"
                        className="flex size-28 items-center justify-center rounded-full bg-navy font-sans text-3xl font-bold text-white shadow-lg"
                      >
                        {initials}
                      </span>
                    </div>
                  )}
                  {isCeo && (
                    <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-xs font-semibold text-white">
                      <Crown className="size-3.5" aria-hidden="true" />
                      CEO
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-5 text-center">
                  <h3 className="text-lg font-bold text-navy">{member.name[lang]}</h3>
                  <p className="text-sm font-semibold text-primary">{member.role[lang]}</p>
                  <p className="text-sm text-muted-foreground">{member.sub[lang]}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
