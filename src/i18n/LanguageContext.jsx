import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { translations } from './translations'

const STORAGE_KEY = 'lang'
const LanguageContext = createContext(null)

// Resolved synchronously during the first render, before first paint:
// a saved manual choice always wins; otherwise detect the browser language
// (pl* → Polish, anything else → English). Detection is never persisted:
// only a manual toggle writes to localStorage, so a visitor who never
// touched the switch keeps following their browser setting.
function getInitialLang() {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'pl' || stored === 'en') return stored
  const browserLang =
    (navigator.languages && navigator.languages[0]) || navigator.language || ''
  return browserLang.toLowerCase().startsWith('pl') ? 'pl' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  // Manual choice: persist it so it always wins over detection.
  const setLang = useCallback((next) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }, [])

  useEffect(() => {
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
