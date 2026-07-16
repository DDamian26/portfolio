import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

export default function About() {
  const { t } = useLanguage()
  const paragraphs = t('about.paragraphs')
  const highlights = t('about.highlights')

  return (
    <section id="about" className="mx-auto max-w-[1100px] px-6 py-32">
      <div className="grid items-center gap-14 lg:grid-cols-[2fr_3fr]">
        {/* Portrait placeholder — swap for a real photo:
            <img src="/portrait.jpg" alt="Damian Kaczor" className="absolute inset-0 h-full w-full object-cover" /> */}
        <Reveal>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-card border border-border-warm bg-card shadow-glow">
            <div className="absolute inset-0 bg-gradient-to-b from-card-hover via-card to-bg" />
            <svg
              viewBox="0 0 100 125"
              className="absolute inset-0 h-full w-full text-accent/15"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="50" cy="45" r="20" />
              <path d="M15 125c0-22 15-36 35-36s35 14 35 36H15z" />
            </svg>
          </div>
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
