import { motion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { fadeUp, stagger } from '../lib/motion'

const container = stagger(0.18, 0.25)
const item = fadeUp

export default function Splash() {
  const { t } = useLanguage()

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center gap-7">
        <motion.h1
          variants={item}
          className="text-7xl font-black tracking-tight text-heading sm:text-8xl lg:text-9xl"
        >
          {t('splash.name')}
          <span className="text-accent drop-shadow-glow">.</span>
        </motion.h1>

        <motion.p variants={item} className="max-w-2xl text-xl leading-relaxed sm:text-2xl">
          {t('splash.slogan')}
        </motion.p>
      </motion.div>

      {/* Scroll cue */}
      <motion.a
        href="#hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted/80 transition-colors duration-300 hover:text-accent"
      >
        {t('splash.scroll')}
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <path d="M5 9l7 7 7-7" />
        </motion.svg>
      </motion.a>
    </section>
  )
}
