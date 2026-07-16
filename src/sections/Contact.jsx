import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import MagneticButton from '../components/MagneticButton'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'

const X_URL = 'https://x.com/DamianEditsVid'
const INSTAGRAM_URL = 'https://www.instagram.com/damian.montuje/?hl=en'

// Calendly inline embed, themed via its URL parameters to sit as close to
// the palette as Calendly allows (hex values mirror the @theme tokens:
// card #161204, heading #fdf6e3, accent #ffd60a). The interior is
// Calendly's own UI; no CSS hacks on its internals.
const CALENDLY_URL =
  'https://calendly.com/dkaczor27/new-meeting?hide_gdpr_banner=1&background_color=161204&text_color=fdf6e3&primary_color=ffd60a'

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L2.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3z" />
    </svg>
  )
}

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Contact() {
  const { t } = useLanguage()
  // The Calendly iframe mounts only when the section approaches the
  // viewport; the wrapper reserves its full height so nothing shifts.
  const [calendlyRef, calendlyNear] = useNearViewport('400px')

  return (
    // Extra vertical room and no card wrapper: the emptier warm space here
    // is where the cursor glow reads most clearly.
    <section id="contact" className="mx-auto max-w-[1100px] px-6 py-48 sm:py-56">
      <Reveal className="flex flex-col items-center gap-8 text-center">
        <Badge>{t('contact.badge')}</Badge>

        <h2 className="max-w-3xl text-4xl font-extrabold tracking-tight text-heading sm:text-6xl">
          <AccentText text={t('contact.title')} />
        </h2>

        <p className="max-w-xl text-lg leading-relaxed sm:text-xl">{t('contact.subtitle')}</p>

        <MagneticButton
          href={t('links.workWithMe')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 rounded-full bg-accent px-12 py-5 text-lg font-bold text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
        >
          {t('contact.cta')}
        </MagneticButton>

        <p className="text-sm text-muted">{t('contact.note')}</p>

        {/* Booking block */}
        <div className="mt-6 w-full">
          <p className="mb-4 text-lg font-semibold text-heading">{t('contact.calendlyLead')}</p>
          <div
            ref={calendlyRef}
            className="mx-auto h-[900px] w-full max-w-[700px] overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm sm:h-[720px]"
          >
            {calendlyNear && (
              <iframe
                src={CALENDLY_URL}
                title="Calendly"
                className="h-full w-full"
                loading="lazy"
              />
            )}
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('contact.followX')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-glow-sm"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('contact.followInstagram')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-glow-sm"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        </div>
      </Reveal>
    </section>
  )
}
