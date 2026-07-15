import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

export default function Testimonials() {
  const { t } = useLanguage()
  const items = t('testimonials.items')

  return (
    <section id="testimonials" className="mx-auto max-w-[1100px] px-6 py-32">
      <SectionHeading section="testimonials" />

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <figure className="flex h-full flex-col justify-between gap-6 rounded-card border border-border-warm bg-card p-7 shadow-glow-sm transition-shadow duration-500 hover:shadow-glow">
              <div>
                <svg width="28" height="20" viewBox="0 0 28 20" fill="currentColor" className="text-accent" aria-hidden="true">
                  <path d="M0 20V10.4C0 4.3 3.8.8 10 0l1.4 3.4c-3.4 1-5.2 3-5.4 6H11V20H0zm17 0V10.4C17 4.3 20.8.8 27 0l1 3.4c-3.4 1-5.2 3-5.4 6H28V20H17z" opacity="0.9" transform="scale(0.95)" />
                </svg>
                <blockquote className="mt-4 leading-relaxed">{item.quote}</blockquote>
              </div>
              <figcaption>
                <div className="font-bold text-heading">{item.name}</div>
                <div className="text-sm text-muted">{item.role}</div>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
