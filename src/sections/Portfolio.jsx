import { motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import TiltCard from '../components/TiltCard'
import VideoSlot from '../components/VideoSlot'
import { useLanguage } from '../i18n/LanguageContext'
import { fadeUp, stagger, VIEWPORT_ONCE } from '../lib/motion'

const container = stagger(0.15)
const item = fadeUp

export default function Portfolio() {
  const { t } = useLanguage()
  const cards = t('portfolio.cards')

  return (
    <section id="work" className="mx-auto max-w-[1100px] px-6 py-32">
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
            <VideoSlot title={t('portfolio.anchor.title')} driveId="1nZKPkkJfgHa36tp-2VrbP24GD1Q4AdG8" />
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

        {/* Three short-form cards.
            Populate each: <VideoSlot vertical src="/clips/hook.mp4" /> or youtubeId="..." */}
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {/* Index keys keep these mounted across language switches,
              so the one-time reveal doesn't re-trigger. */}
          {cards.map((card, i) => (
            <motion.div key={i} variants={item}>
              <TiltCard className="group h-full overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-[border-color,box-shadow] duration-500 hover:border-border-warm-strong hover:shadow-glow">
                <div className="cursor-pointer">
                  <VideoSlot vertical title={card.title} playSize={52} />
                </div>
                <div className="flex flex-col gap-1.5 p-6">
                  <h3 className="text-lg font-bold tracking-tight text-heading">{card.title}</h3>
                  <p className="text-sm leading-relaxed">{card.description}</p>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
