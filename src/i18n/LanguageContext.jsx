import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'lang'
const LanguageContext = createContext(null)

function getInitialLang() {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'pl' || stored === 'en' ? stored : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
    document.title = translations[lang].meta.title
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', translations[lang].meta.description)
  }, [lang])

  // t('hero.title1') → string; t('portfolio.cards') → array/object.
  // Falls back to English if a key is missing from the active language.
  const t = useCallback(
    (path) => {
      const resolve = (dict) => path.split('.').reduce((node, key) => node?.[key], dict)
      const value = resolve(translations[lang])
      return value !== undefined ? value : resolve(translations.en)
    },
    [lang],
  )

  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
