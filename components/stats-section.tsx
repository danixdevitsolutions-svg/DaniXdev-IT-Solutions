'use client'

import { useLanguage } from './language-provider'

export function StatsSection() {
  const { t } = useLanguage()

  return (
    <section aria-label="Company statistics" className="px-4 md:px-6">
      <div className="mx-auto max-w-7xl rounded-3xl bg-navy px-6 py-10 md:px-12">
        <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {t.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <dt className="order-2 text-sm text-white/70">{stat.label}</dt>
              <dd className="order-1 font-sans text-3xl font-extrabold text-white md:text-4xl" dir="ltr">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
