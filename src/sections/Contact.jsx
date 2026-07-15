import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

const EMAIL = 'dkaczor27@gmail.com'

export default function Contact() {
  const { t } = useLanguage()

  return (
    <section id="contact" className="mx-auto max-w-[1100px] px-6 py-32">
      <Reveal>
        <div className="relative overflow-hidden rounded-card border border-border-warm bg-card px-6 py-16 shadow-glow-sm sm:px-16 sm:py-20">
          {/* Warm glow inside the card so the CTA feels lit from above */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-6 text-center">
            <SectionHeading section="contact" />

            <a
              href={`mailto:${EMAIL}`}
              className="mt-2 rounded-full bg-accent px-10 py-4 text-lg font-bold text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
            >
              {t('contact.cta')}
            </a>

            <p className="text-sm text-muted">
              {t('contact.emailLabel')}{' '}
              <a href={`mailto:${EMAIL}`} className="font-semibold text-accent hover:underline">
                {EMAIL}
              </a>
            </p>
            <p className="text-sm text-muted">{t('contact.note')}</p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
