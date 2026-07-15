import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import { EASE, fadeUp, stagger, VIEWPORT_ONCE } from '../lib/motion'

// Renders an answer string, turning [[marked]] segments into links
// that smooth-scroll to the Contact section.
function AnswerText({ text }) {
  return String(text)
    .split(/\[\[(.+?)\]\]/g)
    .map((part, i) =>
      i % 2 === 1 ? (
        <a
          key={i}
          href="#contact"
          className="font-semibold text-accent underline underline-offset-4 transition-colors duration-300 hover:text-accent-soft"
        >
          {part}
        </a>
      ) : (
        part
      ),
    )
}

function FaqItem({ item, index, open, onToggle }) {
  return (
    <motion.li variants={fadeUp}>
      <div
        className={`overflow-hidden rounded-card border bg-card transition-[border-color,box-shadow] duration-500 ${
          open ? 'border-border-warm-strong shadow-glow' : 'border-border-warm shadow-glow-sm'
        }`}
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
            <span className="text-base font-bold tracking-tight text-heading sm:text-lg">
              {item.q}
            </span>
            {/* Plus icon — rotates 45° into an X when open */}
            <motion.span
              aria-hidden="true"
              animate={{ rotate: open ? 45 : 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-warm text-accent"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </motion.span>
          </button>
        </h3>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={`faq-a-${index}`}
              role="region"
              aria-labelledby={`faq-q-${index}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <p className="px-6 pb-6 leading-relaxed sm:px-7">
                <AnswerText text={item.a} />
              </p>
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
  const [openIndex, setOpenIndex] = useState(null)

  // FAQPage structured data, kept in sync with the active language.
  useEffect(() => {
    let script = document.getElementById('faq-jsonld')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      script.id = 'faq-jsonld'
      document.head.appendChild(script)
    }
    const stripMarkers = (text) => text.replace(/\[\[(.+?)\]\]/g, '$1')
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: lang,
      mainEntity: items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: stripMarkers(item.a) },
      })),
    })
  }, [lang, items])

  return (
    <section id="faq" className="mx-auto max-w-[1100px] px-6 py-32">
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
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </motion.ul>
    </section>
  )
}
