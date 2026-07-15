import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import MagneticButton from '../components/MagneticButton'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'

// Swap these when the real accounts are ready.
const EMAIL = 'dkaczor27@gmail.com'
const X_URL = 'https://x.com/yourhandle'
const YOUTUBE_URL = 'https://youtube.com/@yourchannel'

function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.2l7.3-8.3L2.5 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.1 3.8H5.3l12.5 16.3z" />
    </svg>
  )
}

function YouTubeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.5 6.5a3 3 0 0 0-2.1-2.2C19.5 3.8 12 3.8 12 3.8s-7.5 0-9.4.5A3 3 0 0 0 .5 6.5 31.5 31.5 0 0 0 0 12c0 1.9.2 3.7.5 5.5a3 3 0 0 0 2.1 2.2c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.2c.3-1.8.5-3.6.5-5.5s-.2-3.7-.5-5.5zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
    </svg>
  )
}

export default function Contact() {
  const { t } = useLanguage()

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
          href={`mailto:${EMAIL}`}
          className="mt-4 rounded-full bg-accent px-12 py-5 text-lg font-bold text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
        >
          {t('contact.cta')}
        </MagneticButton>

        <p className="text-sm text-muted">{t('contact.note')}</p>

        <div className="mt-2 flex items-center gap-4">
          <a
            href={X_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('contact.followX')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-glow-sm"
          >
            <XIcon className="h-4 w-4" />
          </a>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t('contact.followYouTube')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-glow-sm"
          >
            <YouTubeIcon className="h-5 w-5" />
          </a>
        </div>
      </Reveal>
    </section>
  )
}
