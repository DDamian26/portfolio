import { useCallback, useEffect, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'

// Comparison rows. Each row can hold static media (rawSrc/editedSrc: an
// image, or a muted .mp4 loop) or a pair of Google Drive videos
// (rawDriveId/editedDriveId). Drive rows show the players paused on their
// first frame; visitors drag the handle to compare the grade, and can start
// playback with Drive's own controls in the reserved bottom strip.
const ROWS = [
  {
    rawDriveId: '1qEAsv59goDF0Y6gbyHeAmuhmeTjSG8pi',
    editedDriveId: '1AG4_IjkQ4RWFwfyBdRYU6h93p3ziIkBK',
  },
  {
    rawDriveId: '1Kp_d8Y_vXPglJGbLm3-tGuNYhX9su2mE',
    editedDriveId: '1V24aAso8vSs4V7grxS2NQo7jDigJBa5N',
  },
  {
    rawDriveId: '1LGezGRoLrjmY4AIDruNO7G7Tn3kldPI8',
    editedDriveId: '1z5GAqOawApDjHmm1fbqKHIGjPtKsH299',
  },
]

const isVideo = (src) => /\.(mp4|webm|mov)$/i.test(src)

// One half of a static comparison: image, muted video loop, or placeholder.
function CompareMedia({ src, variant }) {
  const placeholder =
    variant === 'raw'
      ? 'bg-gradient-to-br from-muted/25 via-card to-bg'
      : 'bg-gradient-to-br from-accent/25 via-card-hover to-bg'

  if (src && isVideo(src)) {
    return <video className="absolute inset-0 h-full w-full object-cover" src={src} autoPlay muted loop playsInline />
  }
  if (src) {
    return <img className="absolute inset-0 h-full w-full object-cover" src={src} alt="" loading="lazy" />
  }
  return <div className={`absolute inset-0 ${placeholder}`} />
}

function ComparisonSlider({ row, rawLabel, editedLabel }) {
  const hasDriveVideos = Boolean(row.rawDriveId && row.editedDriveId)
  const containerRef = useRef(null)
  // Drive rows mount their two iframes only when the row nears the viewport.
  const [nearRef, isNear] = useNearViewport('300px')
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)

  const setRefs = (el) => {
    containerRef.current = el
    nearRef.current = el
  }

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(97, Math.max(3, pct)))
  }, [])

  const onPointerDown = (e) => {
    // Grab only: no position jump on press, movement does the work.
    e.preventDefault()
    setDragging(true)
  }

  // Cross-origin iframes swallow pointer events (setPointerCapture doesn't
  // reliably survive them either), which would freeze a drag the moment the
  // cursor crossed a player. So while dragging we listen on window and
  // raise a transparent shield over the card (rendered below); the shield
  // exists only mid-drag, so at rest every click reaches the players.
  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => updateFromClientX(e.clientX)
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, updateFromClientX])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(3, p - 4))
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(97, p + 4))
  }

  return (
    <div
      ref={setRefs}
      className="relative aspect-video select-none overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow"
    >
      {hasDriveVideos ? (
        <>
          {/* RAW: full base layer, visible left of the handle.
              We deliberately don't script the Drive players (no autoplay,
              no mute, no sync): they sit paused on their first frame, and
              their native controls stay usable in the bottom strip. */}
          <div className="absolute inset-0">
            {isNear && (
              <iframe
                className="h-full w-full"
                src={`https://drive.google.com/file/d/${row.rawDriveId}/preview`}
                title={rawLabel}
                allow="autoplay; fullscreen"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
          {/* EDITED: full-card top layer, clipped to the right of the handle */}
          <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
            {isNear && (
              <iframe
                className="h-full w-full"
                src={`https://drive.google.com/file/d/${row.editedDriveId}/preview`}
                title={editedLabel}
                allow="autoplay; fullscreen"
                allowFullScreen
                loading="lazy"
              />
            )}
          </div>
        </>
      ) : (
        <>
          {/* EDITED: full base layer */}
          <div className="absolute inset-0">
            <CompareMedia src={row.editedSrc} variant="edited" />
          </div>
          {/* RAW: top layer, clipped to the left of the handle */}
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <CompareMedia src={row.rawSrc} variant="raw" />
          </div>
        </>
      )}

      {/* Shield: exists ONLY mid-drag, so window keeps receiving pointer
          moves instead of the iframes swallowing them. At rest it's absent
          and every click lands on the players. */}
      {dragging && <div className="absolute inset-0 z-20 cursor-grabbing" />}

      {/* Drag happens ONLY on this handle group (24px strip along the
          divider + a 44px knob), never on the card itself. Once grabbed,
          the window listeners track the drag across the full width. */}
      <div
        role="slider"
        aria-label={`${rawLabel} / ${editedLabel}`}
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className={`absolute inset-y-0 z-30 w-6 -translate-x-1/2 touch-none outline-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{ left: `${position}%` }}
      >
        {/* Divider line, visual only */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent shadow-glow-lg"
        />
        {/* Knob: 44px hit area, one gentle pulse when the row first appears
            so it reads as the draggable thing now that the card itself isn't */}
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow-lg ${
            isNear ? 'handle-pulse' : ''
          }`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
          </svg>
        </span>
      </div>

      {/* Labels pinned above everything */}
      <span className="pointer-events-none absolute left-3 top-3 z-40 rounded-full border border-border-warm bg-bg/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted">
        {rawLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-40 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg">
        {editedLabel}
      </span>
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
              key={i}
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
                  row={ROWS[i] ?? {}}
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
