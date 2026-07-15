import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

function PlayButton({ size = 72 }) {
  return (
    <span
      style={{ width: size, height: size }}
      className="flex items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-all duration-300 group-hover:scale-110 group-hover:shadow-glow-lg"
    >
      <svg width={size * 0.36} height={size * 0.36} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M7 4.5v15l13-7.5-13-7.5z" />
      </svg>
    </span>
  )
}

export default function Portfolio() {
  const { t } = useLanguage()
  const cards = t('portfolio.cards')

  return (
    <section id="work" className="mx-auto max-w-[1100px] px-6 py-32">
      <SectionHeading section="portfolio" />

      {/* Full-width long-form anchor piece */}
      <Reveal className="mt-16">
        <article className="group overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow">
          <div className="relative flex aspect-video cursor-pointer items-center justify-center bg-gradient-to-br from-[#241c07] via-card to-bg">
            <PlayButton />
            <span className="absolute bottom-4 right-4 rounded-full bg-bg/80 px-3 py-1 text-xs font-semibold text-heading">
              {t('portfolio.anchor.duration')}
            </span>
            <span className="absolute left-4 top-4 rounded-full border border-border-warm bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {t('portfolio.anchor.tag')}
            </span>
          </div>
          <div className="flex flex-col gap-2 p-7 sm:p-9">
            <h3 className="text-2xl font-bold tracking-tight text-heading">
              {t('portfolio.anchor.title')}
            </h3>
            <p className="max-w-2xl leading-relaxed">{t('portfolio.anchor.description')}</p>
          </div>
        </article>
      </Reveal>

      {/* Three short-form capability cards */}
      <div className="mt-8 grid gap-8 sm:grid-cols-3">
        {cards.map((card, i) => (
          <Reveal key={card.title} delay={i * 0.12}>
            <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow">
              <div className="relative flex aspect-[4/5] cursor-pointer items-center justify-center bg-gradient-to-b from-[#1f1806] via-card to-bg">
                <PlayButton size={52} />
              </div>
              <div className="flex flex-col gap-1.5 p-6">
                <h3 className="text-lg font-bold tracking-tight text-heading">{card.title}</h3>
                <p className="text-sm leading-relaxed">{card.description}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
