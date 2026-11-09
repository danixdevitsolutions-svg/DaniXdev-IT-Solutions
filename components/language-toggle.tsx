'use client'

import { cn } from '@/lib/utils'
import { useLanguage } from './language-provider'

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage()

  return (
    <div
      role="group"
      aria-label="Language"
      dir="ltr"
      className={cn('relative inline-flex items-center rounded-full border border-border bg-secondary p-1', className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full bg-primary shadow-sm transition-transform duration-300',
          lang === 'ur' ? 'translate-x-full' : 'translate-x-0',
        )}
      />
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={cn(
          'relative z-10 w-16 rounded-full py-1.5 font-sans text-xs font-semibold transition-colors',
          lang === 'en' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLang('ur')}
        aria-pressed={lang === 'ur'}
        className={cn(
          'relative z-10 w-16 rounded-full py-1 font-urdu text-sm font-semibold transition-colors',
          lang === 'ur' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        اردو
      </button>
    </div>
  )
}
