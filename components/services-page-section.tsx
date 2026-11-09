'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Phone, X } from 'lucide-react'
import { SectionHeading } from './section-heading'
import { useLanguage } from './language-provider'

export function ServicesPageSection() {
  const { content, lang } = useLanguage()
  const [activeImage, setActiveImage] = useState<{ title: string; image: string } | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (activeImage && !dialog.open) dialog.showModal()
    if (!activeImage && dialog.open) dialog.close()
  }, [activeImage])

  return (
    <section aria-labelledby="service-packages-title" className="px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <SectionHeading
          id="service-packages-title"
          eyebrow={content.servicePageHeading.eyebrow[lang]}
          title={content.servicePageHeading.title[lang]}
          subtitle={content.servicePageHeading.subtitle[lang]}
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.servicePosters.filter((service) => service.enabled).map(({ id, title, image }) => {
            const serviceTitle = title[lang]
            const inquiry = `Hello DaniXdev, I am interested in ${serviceTitle}.`
            const href = `https://wa.me/${content.brand.phoneIntl}?text=${encodeURIComponent(inquiry)}`

            return (
              <li key={id} className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
                {image?.url ? (
                  <button
                    type="button"
                    aria-label={`Open ${serviceTitle} poster full screen`}
                    onClick={() => setActiveImage({ title: serviceTitle, image: image.url })}
                    className="relative block aspect-[3/4] w-full cursor-zoom-in bg-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <Image
                      src={image.url}
                      alt={`${serviceTitle} service details and pricing`}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                      className="object-contain"
                    />
                  </button>
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center bg-secondary p-6 text-center font-semibold text-muted-foreground">
                    {serviceTitle}
                  </div>
                )}
                <div className="p-4">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Send a WhatsApp message about ${serviceTitle}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1DA851]"
                  >
                    <span className="relative inline-flex size-5 items-center justify-center" aria-hidden="true">
                      <MessageCircle className="absolute size-5" strokeWidth={2.5} />
                      <Phone className="size-2.5 fill-white" strokeWidth={3} />
                    </span>
                    Send Message
                  </a>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <dialog
        ref={dialogRef}
        aria-label={activeImage ? `${activeImage.title} service poster` : undefined}
        onClose={() => setActiveImage(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setActiveImage(null)
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-4 text-white backdrop:bg-black/90"
      >
        {activeImage && (
          <div className="relative mx-auto h-full w-full max-w-6xl">
            <Image
              src={activeImage.image}
              alt={`${activeImage.title} service details and pricing`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              autoFocus
              aria-label="Close image preview"
              onClick={() => setActiveImage(null)}
              className="absolute end-0 top-0 z-10 inline-flex size-11 items-center justify-center rounded-full bg-white text-navy shadow-lg transition-colors hover:bg-secondary"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>
        )}
      </dialog>
    </section>
  )
}
