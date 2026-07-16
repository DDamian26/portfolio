import Badge from '../components/Badge'
import MagneticButton from '../components/MagneticButton'
import PlayIcon from '../components/PlayIcon'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  return (
    // min-h + centered content keeps the section feeling like its own
    // full-viewport-ish beat now that it ends at the CTAs.
    <section
      id="hero"
      className="mx-auto flex min-h-[70vh] max-w-[1100px] flex-col justify-center px-6 py-24"
    >
      <Reveal className="flex flex-col items-center gap-7 text-center">
        <Badge icon={<PlayIcon className="h-2.5 w-2.5" />}>{t('hero.badge')}</Badge>

        {/* Controlled two-line break: line 1 off-white, line 2 yellow.
            Each line may wrap internally on narrow screens, but the color
            split never moves. */}
        <h2 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          <span className="block text-heading">{t('hero.titleLine1')}</span>
          <span className="block text-accent">{t('hero.titleLine2')}</span>
        </h2>

        <p className="max-w-2xl text-lg leading-relaxed sm:text-xl">{t('hero.subtitle')}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <MagneticButton
            href="#work"
            className="rounded-full bg-accent px-8 py-3.5 text-base font-bold text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
          >
            {t('hero.ctaPrimary')}
          </MagneticButton>
          <MagneticButton
            href="#contact"
            className="rounded-full border border-border-warm-strong px-8 py-3.5 text-base font-semibold text-heading transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            {t('hero.ctaSecondary')}
          </MagneticButton>
        </div>
      </Reveal>
    </section>
  )
}
