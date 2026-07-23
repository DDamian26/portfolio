import { motion } from 'framer-motion'
import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export default function About() {
  const { t } = useLanguage()
  const paragraphs = t('about.paragraphs')
  const highlights = t('about.highlights')

  return (
    <section id="about" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
      <div className="grid items-center gap-14 lg:grid-cols-[2fr_3fr]">
        <Reveal>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative mx-auto w-full max-w-sm overflow-hidden rounded-card border border-border-warm bg-card shadow-glow aspect-[9/16] max-h-[520px] lg:max-h-[620px]"
          >
            <img
              src="/images/damian-portrait.jpg"
              alt={t('about.portraitAlt')}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </motion.div>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col items-start gap-5">
          <Badge>{t('about.badge')}</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
            <AccentText text={t('about.title')} />
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-lg leading-relaxed ${i === paragraphs.length - 1 ? 'font-semibold text-heading' : ''}`}
            >
              {p}
            </p>
          ))}

          <div className="mt-4 flex flex-wrap gap-3">
            {highlights.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border-warm bg-accent/5 px-4 py-2 text-sm font-semibold text-body"
              >
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
