import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section id="hero" className="mx-auto max-w-[1100px] px-6 py-32 sm:py-40">
      <Reveal className="flex flex-col items-center gap-7 text-center">
        <Badge>{t('hero.badge')}</Badge>

        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-heading sm:text-6xl">
          {t('hero.title1')}
          <span className="text-accent">{t('hero.titleAccent')}</span>
          {t('hero.title2')}
        </h2>

        <p className="max-w-2xl text-lg leading-relaxed sm:text-xl">{t('hero.subtitle')}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#contact"
            className="rounded-full bg-accent px-8 py-3.5 text-base font-bold text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
          >
            {t('hero.ctaPrimary')}
          </a>
          <a
            href="#work"
            className="rounded-full border border-border-warm-strong px-8 py-3.5 text-base font-semibold text-heading transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            {t('hero.ctaSecondary')}
          </a>
        </div>
      </Reveal>
    </section>
  )
}
