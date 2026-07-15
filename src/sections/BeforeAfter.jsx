import { useCallback, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

// Comparison rows. Populate `rawSrc` / `editedSrc` later with real media —
// a screenshot ("/compare/color-raw.jpg") or a short muted loop
// ("/compare/color-raw.mp4"); the layout doesn't change.
const ROWS = [
  { rawSrc: null, editedSrc: null },
  { rawSrc: null, editedSrc: null },
  { rawSrc: null, editedSrc: null },
]

const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src)

// One half of the comparison: image, muted video loop, or warm placeholder.
function CompareMedia({ src, variant }) {
  const placeholder =
    variant === 'raw'
      ? 'bg-gradient-to-br from-muted/25 via-card to-bg'
      : 'bg-gradient-to-br from-accent/25 via-card-hover to-bg'

  if (src && isVideo(src)) {
    return <video className="absolute inset-0 h-full w-full object-cover" src={src} autoPlay muted loop playsInline />
  }
  if (src) {
    return <img className="absolute inset-0 h-full w-full object-cover" src={src} alt="" />
  }
  return <div className={`absolute inset-0 ${placeholder}`} />
}

function ComparisonSlider({ rawSrc, editedSrc, rawLabel, editedLabel }) {
  const containerRef = useRef(null)
  const [position, setPosition] = useState(50)
  const draggingRef = useRef(false)

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(97, Math.max(3, pct)))
  }, [])

  const onPointerDown = (e) => {
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateFromClientX(e.clientX)
  }
  const onPointerMove = (e) => {
    if (draggingRef.current) updateFromClientX(e.clientX)
  }
  const onPointerUp = () => {
    draggingRef.current = false
  }
  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(3, p - 4))
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(97, p + 4))
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      role="slider"
      aria-label={`${rawLabel} / ${editedLabel}`}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className="relative aspect-video cursor-ew-resize touch-none select-none overflow-hidden rounded-card border border-border-warm shadow-glow-sm outline-none transition-shadow duration-500 hover:shadow-glow focus-visible:border-accent"
    >
      {/* EDITED — full layer, label pinned top-right */}
      <div className="absolute inset-0">
        <CompareMedia src={editedSrc} variant="edited" />
        <span className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg">
          {editedLabel}
        </span>
      </div>

      {/* RAW — clipped layer, label pinned top-left */}
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <CompareMedia src={rawSrc} variant="raw" />
        <span className="absolute left-3 top-3 rounded-full border border-border-warm bg-bg/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
          {rawLabel}
        </span>
      </div>

      {/* Yellow drag handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-accent shadow-glow-lg"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow-lg">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}

export default function BeforeAfter() {
  const { t } = useLanguage()
  const items = t('beforeAfter.items')

  return (
    <section id="results" className="mx-auto max-w-[1100px] px-6 py-32">
      <SectionHeading section="beforeAfter" />

      <div className="mt-16 flex flex-col gap-14">
        {items.map((item, i) => {
          const captionRight = i % 2 === 1
          return (
            <Reveal
              key={item.title}
              className={`grid items-center gap-6 lg:gap-10 ${
                captionRight ? 'lg:grid-cols-[2.2fr_1fr]' : 'lg:grid-cols-[1fr_2.2fr]'
              }`}
            >
              <div className={captionRight ? 'lg:order-2 lg:text-right' : ''}>
                <h3 className="text-xl font-bold tracking-tight text-heading">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.description}</p>
              </div>
              <div className={captionRight ? 'lg:order-1' : ''}>
                <ComparisonSlider
                  rawSrc={ROWS[i]?.rawSrc}
                  editedSrc={ROWS[i]?.editedSrc}
                  rawLabel={t('beforeAfter.raw')}
                  editedLabel={t('beforeAfter.edited')}
                />
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
