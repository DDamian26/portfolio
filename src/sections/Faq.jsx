import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import { EASE, fadeUp, stagger, VIEWPORT_ONCE } from '../lib/motion'

// Shared site easing as a CSS timing function, so the CSS hover/chevron
// transitions move with the same curve as the framer animations.
const CSS_EASE = 'cubic-bezier(0.22,1,0.36,1)'

function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

// Renders answer text, turning [[marked]] segments into links that
// smooth-scroll to the booking panel (#book).
function AnswerText({ text }) {
  return String(text)
    .split(/\[\[(.+?)\]\]/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <a
          key={i}
          href="#book"
          className="font-semibold text-accent underline underline-offset-4 transition-colors duration-300 hover:text-accent-soft"
        >
          {part}
        </a>
      ) : (
        part
      ),
    )
}

function FaqItem({ item, index, open, onToggle, reduced }) {
  const bullets = Array.isArray(item.a)
  return (
    <motion.li variants={fadeUp} className="group relative">
      {/* Soft yellow bottom glow that fades in on hover (sits behind the card). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 bottom-0 h-10 translate-y-1/2 rounded-full bg-accent/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ transitionTimingFunction: CSS_EASE }}
      />
      {/* Card. Hover: border brightens, glow, lifts 2px. Open: border glow
          intensifies and stays. Shared site easing. */}
      <div
        className={`relative overflow-hidden rounded-card border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-border-warm-strong hover:shadow-glow ${
          open ? 'border-border-warm-strong shadow-glow' : 'border-border-warm shadow-glow-sm'
        }`}
        style={{ transitionTimingFunction: CSS_EASE }}
      >
        <h3>
          <button
            type="button"
            id={`faq-q-${index}`}
            aria-expanded={open}
            aria-controls={`faq-a-${index}`}
            onClick={onToggle}
            className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-card px-6 py-5 text-left sm:px-7"
          >
            <span className="text-base font-bold tracking-tight text-heading sm:text-lg">{item.q}</span>
            {/* Chevron: down when closed, +45° on hover (closed only), 180° (up)
                when open. Same easing as the panel. */}
            <span
              aria-hidden="true"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-warm text-accent transition-transform duration-300 ${
                open ? 'rotate-180' : 'group-hover:rotate-45'
              }`}
              style={{ transitionTimingFunction: CSS_EASE }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`faq-a-${index}`}
              role="region"
              aria-labelledby={`faq-q-${index}`}
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              {bullets ? (
                <motion.ul
                  className="flex flex-col gap-2.5 px-6 pb-6 sm:px-7"
                  initial={reduced ? false : 'hidden'}
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: reduced ? 0 : 0.06, delayChildren: reduced ? 0 : 0.08 } } }}
                >
                  {item.a.map((line, li) => (
                    <motion.li
                      key={li}
                      className="flex items-start gap-3"
                      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { duration: reduced ? 0 : 0.35, ease: EASE } } }}
                    >
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span className="text-sm leading-relaxed text-body sm:text-base">
                        <AnswerText text={line} />
                      </span>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  className="px-6 pb-6 leading-relaxed sm:px-7"
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.08, ease: EASE }}
                >
                  <AnswerText text={item.a} />
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  )
}

export default function Faq() {
  const { lang, t } = useLanguage()
  const items = t('faq.items')
  const reduced = useReducedMotion()
  const [openIndex, setOpenIndex] = useState(null)

  // FAQPage structured data, kept in sync with the active language. Answers may
  // be a string or an array of bullets; flatten to plain text for the schema.
  useEffect(() => {
    let script = document.getElementById('faq-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'faq-jsonld'
      document.head.appendChild(script)
    }
    const strip = (text) => String(text).replace(/\[\[(.+?)\]\]/g, '$1')
    const answerText = (a) => (Array.isArray(a) ? a.map(strip).join(' ') : strip(a))
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: answerText(item.a) },
      })),
    })
  }, [lang, items])

  return (
    <section id="faq" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
      <SectionHeading section="faq" />

      <motion.ul
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={VIEWPORT_ONCE}
        className="mx-auto mt-16 flex max-w-[750px] flex-col gap-4"
      >
        {items.map((item, i) => (
          <FaqItem
            key={i}
            item={item}
            index={i}
            open={openIndex === i}
            reduced={!!reduced}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.ul>

      {/* Closing text CTA — elegant, no button styling. */}
      <p className="mx-auto mt-12 max-w-[750px] text-center text-sm text-muted">
        <AnswerText text={t('faq.cta')} />
      </p>
    </section>
  )
}
