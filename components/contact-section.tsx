'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, MapPin, Phone, Send } from 'lucide-react'
import { useLanguage } from './language-provider'
import { SectionHeading } from './section-heading'

const inputClass =
  'w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15'

export function ContactSection() {
  const { t, content, lang } = useLanguage()
  const f = t.contact.form
  const [status, setStatus] = useState<'idle' | 'error' | 'sent'>('idle')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const get = (key: string) => String(data.get(key) ?? '').trim().slice(0, 1000)
    const name = get('name')
    const phone = get('phone')
    const email = get('email')
    const service = get('service')
    const message = get('message')

    if (!name || !phone || !message) {
      setStatus('error')
      return
    }

    const text = [
      'New inquiry from DaniXdev website',
      `Name: ${name}`,
      `Phone: ${phone}`,
      email && `Email: ${email}`,
      service && `Service: ${service}`,
      `Message: ${message}`,
    ]
      .filter(Boolean)
      .join('\n')

    window.open(`https://wa.me/${content.brand.phoneIntl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    setStatus('sent')
    event.currentTarget.reset()
  }

  const info = [
    { icon: Phone, label: t.contact.phone, value: content.brand.phoneDisplay, href: `tel:+${content.brand.phoneIntl}`, ltr: true },
    { icon: Mail, label: t.contact.email, value: content.brand.email, href: `mailto:${content.brand.email}`, ltr: true },
    { icon: MapPin, label: t.contact.area, value: content.brand.serviceArea[lang], href: undefined, ltr: false },
  ]

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
        <div className="flex flex-col gap-8">
          <SectionHeading id="contact-title" align="start" eyebrow={t.contact.eyebrow} title={t.contact.title} subtitle={t.contact.subtitle} />
          <ul className="flex flex-col gap-4">
            {info.map(({ icon: Icon, label, value, href, ltr }) => {
              const content = (
                <>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className={`truncate font-semibold text-navy ${ltr ? 'font-sans' : ''}`} dir={ltr ? 'ltr' : undefined}>
                      {value}
                    </span>
                  </span>
                </>
              )
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                      {content}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">{content}</div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-xl shadow-navy/5 md:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-medium text-navy">{f.name} *</label>
              <input id="name" name="name" required autoComplete="name" maxLength={100} className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-navy">{f.phone} *</label>
              <input id="phone" name="phone" type="tel" required autoComplete="tel" maxLength={20} dir="ltr" placeholder="03XX XXXXXXX" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-navy">{f.email}</label>
              <input id="email" name="email" type="email" autoComplete="email" maxLength={120} dir="ltr" className={inputClass} />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="service" className="text-sm font-medium text-navy">{f.service}</label>
              <select id="service" name="service" defaultValue="" className={inputClass}>
                <option value="">{f.selectService}</option>
                {content.homeServices.filter((service) => service.enabled).map((service) => (
                  <option key={service.id} value={service.title[lang]}>{service.title[lang]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-navy">{f.message} *</label>
            <textarea id="message" name="message" required rows={5} maxLength={1000} placeholder={f.messagePh} className={`${inputClass} resize-none`} />
          </div>

          <div aria-live="polite">
            {status === 'error' && <p className="text-sm font-medium text-destructive">{f.required}</p>}
            {status === 'sent' && (
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                {f.success}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-navy"
          >
            <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {f.submit}
          </button>
          <p className="text-center text-xs text-muted-foreground">{f.note}</p>
        </form>
      </div>
    </section>
  )
}
