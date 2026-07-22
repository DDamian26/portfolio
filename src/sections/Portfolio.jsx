import { motion } from 'framer-motion'
import SectionHeading from '../components/SectionHeading'
import VideoPlayer from '../components/VideoPlayer'
import YouTubeFacade, { youtubeThumbs } from '../components/YouTubeFacade'
import PosterFrame from '../components/PosterFrame'
import { LightboxProvider, useLightbox } from '../components/VideoLightbox'
import useMobileVideo from '../lib/useMobileVideo'
import { useLanguage } from '../i18n/LanguageContext'
import { fadeUp, stagger, VIEWPORT_ONCE } from '../lib/motion'

const container = stagger(0.15)
const item = fadeUp

// Self-hosted MP4s for the three shorts, in card order (Hook & Retention,
// Caption Design, Raw-to-Cut). `poster` is an explicit still shown on mobile
// (and by the desktop <video poster>); drop compressed JPGs at these paths.
// Until a poster exists the mobile card falls back to the clip's first frame,
// then to the branded placeholder — never a black rectangle.
const SHORTS = [
  { src: '/videos/short-hook-retention.mp4', poster: '/images/poster-hook-retention.jpg' },
  { src: '/videos/short-caption-design.mp4', poster: '/images/poster-caption-design.jpg' },
  { src: '/videos/short-raw-to-cut.mp4', poster: '/images/poster-raw-to-cut.jpg' },
]

// Featured long-form: unlisted YouTube.
const FEATURED_YOUTUBE_ID = 'zQukCd3Qoqc'
// Optional local poster; the facade tries YouTube's thumbnails first, then this.
const FEATURED_POSTER = '/images/featured-poster.jpg'

// The section body lives inside the LightboxProvider so the mobile poster
// buttons can call useLightbox().
function PortfolioBody({ playerLabels }) {
  const { t } = useLanguage()
  const openLightbox = useLightbox()
  const mobile = useMobileVideo()
  const cards = t('portfolio.cards')
  const playLabel = t('portfolio.play')
  const featTitle = t('portfolio.anchor.title')

  return (
    <section id="work" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
      <SectionHeading section="portfolio" />

      <motion.div variants={container} initial="hidden" whileInView="show" viewport={VIEWPORT_ONCE} className="mt-16">
        {/* Featured long-form (YouTube facade on desktop; lightbox on mobile).
            The tag badge is pointer-events-none so it never blocks the player. */}
        <motion.article
          variants={item}
          className="group overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-all duration-500 hover:scale-[1.01] hover:border-border-warm-strong hover:shadow-glow"
        >
          <div className="relative aspect-video overflow-hidden bg-black">
            {mobile ? (
              <PosterFrame
                sources={[...youtubeThumbs(FEATURED_YOUTUBE_ID), FEATURED_POSTER]}
                onClick={() => openLightbox({ type: 'youtube', youtubeId: FEATURED_YOUTUBE_ID, title: featTitle })}
                label={`${playLabel}: ${featTitle}`}
              />
            ) : (
              <YouTubeFacade youtubeId={FEATURED_YOUTUBE_ID} poster={FEATURED_POSTER} title={featTitle} playLabel={playLabel} />
            )}
            <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-border-warm bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              {t('portfolio.anchor.tag')}
            </span>
          </div>
          <div className="flex w-full flex-col gap-2 p-7 sm:p-9">
            <h3 className="text-2xl font-bold tracking-tight text-heading">{featTitle}</h3>
            <p className="w-full leading-relaxed">{t('portfolio.anchor.description')}</p>
          </div>
        </motion.article>

        {/* Three short-form cards: self-hosted MP4s in our custom player. */}
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {cards.map((card, i) => {
            const short = SHORTS[i] || {}
            return (
              <motion.div key={i} variants={item}>
                <article className="h-full overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-[border-color,box-shadow] duration-500 hover:border-border-warm-strong hover:shadow-glow">
                  <div className="relative aspect-[9/16] overflow-hidden bg-black">
                    {mobile ? (
                      <PosterFrame
                        sources={[short.poster]}
                        firstFrameSrc={short.src}
                        onClick={() =>
                          openLightbox({ type: 'mp4', src: short.src, poster: short.poster, vertical: true, title: card.title })
                        }
                        label={`${playLabel}: ${card.title}`}
                      />
                    ) : (
                      <VideoPlayer src={short.src} poster={short.poster} vertical title={card.title} labels={playerLabels} />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-6">
                    <h3 className="text-lg font-bold tracking-tight text-heading">{card.title}</h3>
                    <p className="text-sm leading-relaxed">{card.description}</p>
                  </div>
                </article>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}

export default function Portfolio() {
  const { t } = useLanguage()
  const playerLabels = {
    play: t('portfolio.play'),
    pause: t('portfolio.player.pause'),
    mute: t('portfolio.player.mute'),
    unmute: t('portfolio.player.unmute'),
    fullscreen: t('portfolio.player.fullscreen'),
    seek: t('portfolio.player.seek'),
  }
  return (
    <LightboxProvider closeLabel={t('portfolio.closeVideo')} playerLabels={playerLabels}>
      <PortfolioBody playerLabels={playerLabels} />
    </LightboxProvider>
  )
}
