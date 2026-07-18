import { motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import VideoSlot from '../components/VideoSlot'
import { LightboxProvider } from '../components/VideoLightbox'
import { useLanguage } from '../i18n/LanguageContext'
import { fadeUp, stagger, VIEWPORT_ONCE } from '../lib/motion'

const container = stagger(0.15)
const item = fadeUp

// Google Drive file IDs for the three shorts, in card order
// (Hook & Retention, Caption Design, Raw-to-Cut).
const SHORT_DRIVE_IDS = [
  '1IXYfft2w5EkNjyp6R_tzHqWmShR9YowY',
  '1kdyWbpCgUCwYLiYUOPNDBIlhKRG5Rh9K',
  '1Bbaii-CbEGPNF6brR4fU8sMh9tsg93sM',
]

export default function Portfolio() {
  const { t } = useLanguage()
  const cards = t('portfolio.cards')

  const playLabel = t('portfolio.play')

  return (
    <LightboxProvider closeLabel={t('portfolio.closeVideo')}>
      <section id="work" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
        <SectionHeading section="portfolio" />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT_ONCE}
          className="mt-16"
        >
          {/* Full-width long-form anchor piece (Google Drive embed).
              The tag badge is pointer-events-none so it never blocks the player. */}
          <motion.article
            variants={item}
            className="group overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-all duration-500 hover:scale-[1.01] hover:border-border-warm-strong hover:shadow-glow"
          >
            <div className="relative">
              <VideoSlot
                title={t('portfolio.anchor.title')}
                driveId="1nZKPkkJfgHa36tp-2VrbP24GD1Q4AdG8"
                playLabel={playLabel}
              />
              <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-border-warm bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                {t('portfolio.anchor.tag')}
              </span>
            </div>
            <div className="flex w-full flex-col gap-2 p-7 sm:p-9">
              <h3 className="text-2xl font-bold tracking-tight text-heading">
                {t('portfolio.anchor.title')}
              </h3>
              <p className="w-full leading-relaxed">{t('portfolio.anchor.description')}</p>
            </div>
          </motion.article>

          {/* Three short-form cards, each a vertical Google Drive embed.
              No tilt and no overlay here: the embedded player owns the
              pointer, so the card must sit still while a video plays. */}
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {/* Index keys keep these mounted across language switches,
                so the one-time reveal doesn't re-trigger. */}
            {cards.map((card, i) => (
              <motion.div key={i} variants={item}>
                <article className="h-full overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-[border-color,box-shadow] duration-500 hover:border-border-warm-strong hover:shadow-glow">
                  <VideoSlot vertical title={card.title} driveId={SHORT_DRIVE_IDS[i]} playLabel={playLabel} />
                  <div className="flex flex-col gap-1.5 p-6">
                    <h3 className="text-lg font-bold tracking-tight text-heading">{card.title}</h3>
                    <p className="text-sm leading-relaxed">{card.description}</p>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
    </LightboxProvider>
  )
}
