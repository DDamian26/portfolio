import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import MagneticButton from '../components/MagneticButton'
import PlayIcon from '../components/PlayIcon'
import Reveal from '../components/Reveal'
import VideoSlot from '../components/VideoSlot'
import { useLanguage } from '../i18n/LanguageContext'

export default function Hero() {
  const { t } = useLanguage()

  return (
    <section id="hero" className="mx-auto max-w-[1100px] px-6 py-32 sm:py-40">
      <Reveal className="flex flex-col items-center gap-7 text-center">
        <Badge icon={<PlayIcon className="h-2.5 w-2.5" />}>{t('hero.badge')}</Badge>

        <h2 className="max-w-4xl text-4xl font-extrabold tracking-tight text-heading sm:text-6xl">
          {t('hero.titleLines').map((line, i) => (
            <span key={i} className="block">
              <AccentText text={line} />
            </span>
          ))}
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

      {/* Proof clip — swap in the real video with one line inside <VideoSlot />:
          src="/clips/proof.mp4" or youtubeId="XXXXXXXXXXX" */}
      <Reveal delay={0.15} className="mt-20">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          {t('hero.proofLabel')}
        </p>
        <div className="overflow-hidden rounded-card border border-border-warm shadow-glow-sm transition-shadow duration-500 hover:shadow-glow">
          <VideoSlot title={t('hero.proofLabel')} />
        </div>
      </Reveal>
    </section>
  )
}
