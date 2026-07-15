import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const LANGS = ['en', 'pl']

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage()

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border border-border-warm bg-accent/5 p-0.5"
    >
      {LANGS.map((code) => {
        const active = code === lang
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            className={`relative rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 ${
              active ? 'text-bg' : 'text-muted hover:text-body'
            }`}
          >
            {active && (
              <motion.span
                layoutId="lang-indicator"
                className="absolute inset-0 rounded-full bg-accent shadow-glow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{code}</span>
          </button>
        )
      })}
    </div>
  )
}
