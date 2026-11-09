'use client'

import { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { translations, type Lang } from '@/lib/i18n'
import { doc, onSnapshot } from 'firebase/firestore'
import { firebaseConfigured, getFirebaseServices } from '@/lib/firebase'
import { createDefaultSiteContent, mergeSiteContent, type EditableDictionary, type SiteContent } from '@/lib/site-content'

type LanguageContextValue = {
  lang: Lang
  t: EditableDictionary
  setLang: (lang: Lang) => void
  content: SiteContent
  contentError: string | null
  setContent: Dispatch<SetStateAction<SiteContent>>
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const [content, setContent] = useState<SiteContent>(createDefaultSiteContent)
  const [contentError, setContentError] = useState<string | null>(null)

  useEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = lang === 'ur' ? 'rtl' : 'ltr'
  }, [lang])

  useEffect(() => {
    if (!firebaseConfigured) return

    try {
      const { db } = getFirebaseServices()
      return onSnapshot(
        doc(db, 'siteContent', 'main'),
        (snapshot) => {
          if (snapshot.exists()) setContent(mergeSiteContent(snapshot.data()))
          setContentError(null)
        },
        (error) => {
          console.error('Unable to load website content from Firebase.', error)
          setContentError('Website updates could not be loaded from Firebase.')
        },
      )
    } catch (error) {
      console.error('Unable to connect to Firebase website content.', error)
      setContentError('Website updates could not be loaded from Firebase.')
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t: content.translations[lang] ?? translations[lang],
        content,
        contentError,
        setContent,
      }}
    >
      <div className={lang === 'ur' ? 'font-urdu' : 'font-sans'}>{children}</div>
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
