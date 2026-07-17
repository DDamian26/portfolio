import { useEffect, useRef, useState } from 'react'
import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import MagneticButton from '../components/MagneticButton'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'

const X_URL = 'https://x.com/DamianEditsVid'
const INSTAGRAM_URL = 'https://www.instagram.com/damian.montuje/?hl=en'

// Calendly inline widget, themed to match the palette via URL params.
// background_color mirrors --color-card (161204) so the iframe sits flush
// inside the surrounding booking card with no visible seam. text_color and
// primary_color mirror the heading and accent tokens (hex, no #).
// hide_landing_page_details + hide_event_type_details suppress the widget's
// own header so our left-panel "what to expect" content isn't duplicated inside.
const CALENDLY_URL =
  'https://calendly.com/dkaczor27/new-meeting' +
  '?hide_gdpr_banner=1' +
  '&hide_landing_page_details=1' +
  '&hide_event_type_details=1' +
  '&background_color=161204' +
  '&text_color=FDF6E3' +
  '&primary_color=FFD60A'

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

function ClockIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function VideoIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

function TagIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

const PILL_ICONS = [ClockIcon, VideoIcon, TagIcon]

export default function Contact() {
  const { t } = useLanguage()
  // calendlyTriggerRef: the element whose viewport proximity triggers lazy script load.
  // calendlyContainerRef: the div Calendly will inject its iframe into.
  const [calendlyTriggerRef, calendlyNear] = useNearViewport('400px')
  const calendlyContainerRef = useRef(null)
  // The card sizes to the compact month view by default. On mobile the later
  // booking steps stack vertically and need more room, so we grow on Calendly's
  // date-selected event and shrink again if the user returns to the calendar.
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== 'https://calendly.com') return
      const ev = e.data?.event
      if (typeof ev !== 'string' || !ev.startsWith('calendly.')) return
      // Only mobile needs the growth; desktop lays these steps out side by side.
      if (!window.matchMedia('(max-width: 767px)').matches) return
      if (ev === 'calendly.date_and_time_selected') setExpanded(true)
      else if (ev === 'calendly.event_type_viewed') setExpanded(false)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    if (!calendlyNear || !calendlyContainerRef.current) return

    const container = calendlyContainerRef.current

    const init = () => {
      if (window.Calendly) {
        window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: container })
      }
    }

    if (window.Calendly) {
      init()
      return
    }

    const existing = document.querySelector('script[src*="assets.calendly.com"]')
    if (existing) {
      existing.addEventListener('load', init)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    script.onload = init
    document.head.appendChild(script)
  }, [calendlyNear])

  const pills = t('contact.booking.pills')
  const bullets = t('contact.booking.bullets')

  return (
    <section id="contact" className="mx-auto max-w-[1100px] px-6 py-48 sm:py-56">
      {/* Centered intro */}
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
      </Reveal>

      {/* Booking block: one card wrapping the left "what to expect" panel and
          the Calendly embed. The heading now lives at the top of the left
          panel, inside the card. */}
      <Reveal delay={0.1} className="mt-24">
        {/* items-start keeps both columns sharing the card's top edge. */}
        <div
          ref={calendlyTriggerRef}
          className="grid items-start gap-8 rounded-card border border-border-warm bg-card p-4 shadow-glow-sm sm:p-6 lg:grid-cols-[2fr_3fr] lg:gap-12 lg:p-8"
        >
          {/* Left panel: heading + "What to expect" */}
          <div className="flex flex-col gap-6">
            <h3 className="text-2xl font-extrabold tracking-tight text-heading sm:text-3xl">
              <AccentText text={t('contact.booking.heading')} />
            </h3>
            <p className="leading-relaxed text-body">{t('contact.booking.lead')}</p>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2">
              {pills.map((label, i) => {
                const Icon = PILL_ICONS[i]
                return (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border-warm bg-accent/5 px-3 py-1.5 text-xs font-semibold text-body"
                  >
                    {Icon && <Icon className="h-3.5 w-3.5 text-accent" />}
                    {label}
                  </span>
                )
              })}
            </div>

            {/* Bullet list */}
            <ul className="flex flex-col gap-3">
              {bullets.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm leading-relaxed text-heading">{point}</span>
                </li>
              ))}
            </ul>

            {/* Host footer */}
            <div className="mt-2 flex items-center gap-3 border-t border-border-warm pt-5">
              <img
                src="/images/damian-portrait.png"
                alt="Damian Kaczor"
                className="h-10 w-10 rounded-full object-cover object-top ring-1 ring-border-warm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div>
                <p className="text-sm font-semibold text-heading">{t('contact.booking.hostName')}</p>
                <p className="text-xs text-muted">{t('contact.booking.hostRole')}</p>
              </div>
            </div>
          </div>

          {/* Calendly embed. No card styling of its own (no border/bg/shadow)
              so it sits flush inside the outer card; the widget's own
              background is themed to match --color-card. Height is sized to the
              compact month view so there is no dead space up front; on mobile,
              where Calendly stacks the time-slot/form steps vertically, the
              container grows on the date-selected event (desktop lays those
              steps out side by side at a similar height, so it stays compact). */}
          <div
            ref={calendlyContainerRef}
            className={`w-full overflow-hidden rounded-2xl transition-[height] duration-500 ${
              expanded ? 'h-[880px]' : 'h-[600px] md:h-[620px]'
            }`}
          />
        </div>
      </Reveal>

      {/* Social icons */}
      <Reveal delay={0.2} className="mt-14 flex justify-center items-center gap-4">
        <a
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('contact.followX')}
          className="social-glow flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent"
        >
          <XIcon className="h-4 w-4" />
        </a>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('contact.followInstagram')}
          className="social-glow flex h-11 w-11 items-center justify-center rounded-full border border-border-warm text-muted transition-all duration-300 hover:border-accent hover:text-accent"
        >
          <InstagramIcon className="h-5 w-5" />
        </a>
      </Reveal>
    </section>
  )
}
