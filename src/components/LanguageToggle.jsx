import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const LANGS = ['en', 'pl']

// `instanceId` keeps the sliding-indicator layoutId unique when more than
// one toggle exists (nav + standalone splash toggle).
export default function LanguageToggle({ instanceId = 'nav' }) {
  const { lang, setLang, t } = useLanguage()

  return (
    <div
      role="group"
      aria-label={t('nav.langLabel')}
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
            className={`relative rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors duration-300 lg:px-3 ${
              active ? 'text-bg' : 'text-muted hover:text-body'
            }`}
          >
            {active && (
              <motion.span
                layoutId={`lang-indicator-${instanceId}`}
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
