import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
}

export default function Splash() {
  const { t } = useLanguage()

  return (
    <section id="top" className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-6">
        <motion.p
          variants={item}
          className="text-sm font-semibold uppercase tracking-[0.3em] text-accent"
        >
          {t('nav.name')} · {t('splash.role')}
        </motion.p>

        <motion.h1
          variants={item}
          className="max-w-4xl text-5xl font-black tracking-tight text-heading sm:text-6xl lg:text-7xl"
        >
          {t('splash.title1')}
          <span className="text-accent drop-shadow-[0_0_30px_rgba(255,214,10,0.35)]">
            {t('splash.titleAccent')}
          </span>
          {t('splash.title2')}
        </motion.h1>

        <motion.p variants={item} className="max-w-xl text-lg leading-relaxed sm:text-xl">
          {t('splash.subtitle')}
        </motion.p>
      </motion.div>

      {/* Scroll hint */}
      <motion.a
        href="#hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted transition-colors hover:text-accent"
      >
        {t('splash.scroll')}
        <motion.svg
          width="16"
          height="24"
          viewBox="0 0 16 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <path d="M8 4v14M3 13l5 5 5-5" />
        </motion.svg>
      </motion.a>
    </section>
  )
}
