import { useCallback, useEffect, useRef, useState } from 'react'
import PlayIcon from '../components/PlayIcon'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'
import { setLightSpill } from '../lib/lightSpill'
import { claimPlayback, releasePlayback } from '../lib/videoBus'

// Local MP4 pairs for the three comparison rows, in row order
// (Color & framing, Pacing & graphics, Sound & emphasis).
// Rename/swap files here; drop them into /public/videos/.
// Until a pair exists on disk, its row shows a warm placeholder state.
const ROW_VIDEOS = [
  { raw: '/videos/color-raw.mp4', edited: '/videos/color-edited.mp4' },
  { raw: '/videos/pacing-raw.mp4', edited: '/videos/pacing-edited.mp4' },
  { raw: '/videos/sound-raw.mp4', edited: '/videos/sound-edited.mp4' },
]

const BASE_VOLUME = 0.5
const DRIFT_TOLERANCE = 0.1 // seconds before the lagging video is re-synced
const CROSSFADE_BAND = 10 // audio crossfades across position 45..55

// Only one video plays at a time site-wide (Before/After rows + Portfolio
// shorts): starting one calls claimPlayback() to pause whatever was active.

// Resolves when the video can play through the near future; rejects on
// a load error (missing file).
const waitReady = (video) =>
  new Promise((resolve, reject) => {
    if (video.error) return reject(video.error)
    if (video.readyState >= 3) return resolve()
    const ok = () => {
      cleanup()
      resolve()
    }
    const bad = () => {
      cleanup()
      reject(new Error('video failed to load'))
    }
    const cleanup = () => {
      video.removeEventListener('canplay', ok)
      video.removeEventListener('error', bad)
    }
    video.addEventListener('canplay', ok)
    video.addEventListener('error', bad)
    if (video.readyState === 0) video.load()
  })

function PauseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}

function ComparisonSlider({ videos, rawLabel, editedLabel, playLabel, pauseLabel }) {
  const containerRef = useRef(null)
  const rawRef = useRef(null)
  const editedRef = useRef(null)
  // Tight margin so each row starts fetching just before it's visible,
  // not while sitting a full row further down the page.
  const [nearRef, isNear] = useNearViewport('100px')
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [missing, setMissing] = useState(false)

  const setRefs = (el) => {
    containerRef.current = el
    nearRef.current = el
  }

  // ----- Auto-demo sweep -----
  // When the row enters view it plays a one-time sweep (12% -> 88%, pause,
  // -> 50%) so the transformation is visible with zero interaction. It is
  // driven purely by the mask `position`, independent of the media underneath
  // (Drive iframe today, local MP4 later), so it survives that switch. The
  // first user grab/keypress cancels it permanently for this row.
  const demo = useRef({ raf: 0, started: false, cancelled: false })
  const cancelAutoDemo = useCallback(() => {
    demo.current.cancelled = true
    cancelAnimationFrame(demo.current.raf)
  }, [])

  useEffect(() => {
    if (!isNear || demo.current.started || demo.current.cancelled) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    demo.current.started = true

    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
    const seq = [
      { from: 12, to: 88, dur: 2500 }, // reveal the edit
      { hold: 600 }, // let it land
      { from: 88, to: 50, dur: 900 }, // settle at rest
    ]
    let i = 0
    let segStart = null
    setPosition(12)
    const tick = (now) => {
      if (demo.current.cancelled) return
      const seg = seq[i]
      if (segStart === null) segStart = now
      const elapsed = now - segStart
      if (seg.hold != null) {
        if (elapsed >= seg.hold) {
          i += 1
          segStart = null
        }
      } else {
        const t = Math.min(elapsed / seg.dur, 1)
        setPosition(seg.from + (seg.to - seg.from) * easeInOut(t))
        if (t >= 1) {
          i += 1
          segStart = null
        }
      }
      if (i < seq.length) demo.current.raf = requestAnimationFrame(tick)
    }
    // A short beat after the reveal settles before the sweep begins.
    const startTimer = setTimeout(() => {
      if (!demo.current.cancelled) demo.current.raf = requestAnimationFrame(tick)
    }, 250)
    return () => {
      clearTimeout(startTimer)
      cancelAnimationFrame(demo.current.raf)
    }
  }, [isNear])

  const updateFromClientX = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(97, Math.max(3, pct)))
  }, [])

  // ----- Drag: handle only, tracked on window while active -----
  const onPointerDown = (e) => {
    e.preventDefault()
    cancelAutoDemo() // user takes over; the demo never resumes for this row
    // Interactive light spill (part 2): tell the background to bloom a soft
    // yellow glow from this card's centre while the slider is in hand. The
    // canvas ignores it on mobile / reduced motion, so no need to gate here.
    const rect = containerRef.current.getBoundingClientRect()
    setLightSpill(rect.left + rect.width / 2, rect.top + rect.height / 2, 1)
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => updateFromClientX(e.clientX)
    const onUp = () => {
      setLightSpill(0, 0, 0) // ease the spill back out on release
      setDragging(false)
    }
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
    if (e.key === 'ArrowLeft') {
      cancelAutoDemo()
      setPosition((p) => Math.max(3, p - 4))
    }
    if (e.key === 'ArrowRight') {
      cancelAutoDemo()
      setPosition((p) => Math.min(97, p + 4))
    }
  }

  // ----- Lazy loading: nothing downloads until the row nears the viewport,
  // then this row's videos switch to preload="auto". Rows further down keep
  // preload="none" until their own observers fire. -----
  useEffect(() => {
    if (!isNear) return
    for (const video of [rawRef.current, editedRef.current]) {
      if (video && !video.error) video.preload = 'auto'
    }
  }, [isNear])

  // ----- Audio follows the slider: whichever side holds more of the card
  // carries the audio at BASE_VOLUME, the other is silent, with a soft
  // crossfade around the midpoint. -----
  useEffect(() => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited) return
    const rawShare = Math.min(Math.max((position - (50 - CROSSFADE_BAND / 2)) / CROSSFADE_BAND, 0), 1)
    raw.volume = BASE_VOLUME * rawShare
    edited.volume = BASE_VOLUME * (1 - rawShare)
  }, [position])

  const pauseBoth = useCallback(() => {
    rawRef.current?.pause()
    editedRef.current?.pause()
    setPlaying(false)
    releasePlayback(pauseBoth)
  }, [])

  // ----- One shared play/pause for both videos, gated on BOTH being ready
  // so buffering can't break sync. -----
  const togglePlay = async () => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited || missing || loading) return
    if (playing) {
      pauseBoth()
      return
    }
    claimPlayback(pauseBoth) // pause every other player site-wide (incl. Portfolio)
    setLoading(true)
    raw.preload = 'auto'
    edited.preload = 'auto'
    try {
      await Promise.all([waitReady(raw), waitReady(edited)])
      const t = Math.min(raw.currentTime, edited.currentTime)
      raw.currentTime = t
      edited.currentTime = t
      await Promise.all([raw.play(), edited.play()])
      setPlaying(true)
    } catch {
      pauseBoth()
      setMissing(true)
    } finally {
      setLoading(false)
    }
  }

  // ----- Sync, loop-on-shorter-duration, and missing-file detection -----
  useEffect(() => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited) return

    const restartTogether = () => {
      raw.currentTime = 0
      edited.currentTime = 0
      raw.play().catch(() => {})
      edited.play().catch(() => {})
    }

    const onTime = () => {
      if (raw.paused && edited.paused) return
      // Loop both on the shorter clip so a length mismatch never drifts.
      const loopEnd = Math.min(raw.duration || Infinity, edited.duration || Infinity)
      if (Number.isFinite(loopEnd) && Math.max(raw.currentTime, edited.currentTime) >= loopEnd - 0.08) {
        restartTogether()
        return
      }
      const drift = raw.currentTime - edited.currentTime
      if (Math.abs(drift) > DRIFT_TOLERANCE) {
        // Jump the lagging one forward to the leader.
        if (drift > 0) edited.currentTime = raw.currentTime
        else raw.currentTime = edited.currentTime
      }
    }
    const onError = () => {
      setMissing(true)
      setPlaying(false)
    }

    raw.addEventListener('timeupdate', onTime)
    edited.addEventListener('timeupdate', onTime)
    raw.addEventListener('ended', restartTogether)
    edited.addEventListener('ended', restartTogether)
    raw.addEventListener('error', onError)
    edited.addEventListener('error', onError)
    return () => {
      raw.removeEventListener('timeupdate', onTime)
      edited.removeEventListener('timeupdate', onTime)
      raw.removeEventListener('ended', restartTogether)
      edited.removeEventListener('ended', restartTogether)
      raw.removeEventListener('error', onError)
      edited.removeEventListener('error', onError)
    }
  }, [missing])

  // ----- Auto-pause when the row leaves the viewport or the tab hides -----
  useEffect(() => {
    const el = containerRef.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) pauseBoth()
      },
      { threshold: 0 },
    )
    if (el) observer.observe(el)
    const onVisibility = () => {
      if (document.hidden) pauseBoth()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [pauseBoth])

  return (
    <div
      ref={setRefs}
      className="relative aspect-video select-none overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow"
    >
      {/* RAW: full base layer, visible left of the handle. Warm gradient
          sits behind the video, so before data loads (or if the file is
          missing) the card reads as an intentional dark panel. */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-card to-bg" />
        {!missing && (
          <video
            ref={rawRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videos.raw}
            preload="none"
            playsInline
          />
        )}
      </div>

      {/* EDITED: full-card top layer, clipped to the right of the handle */}
      <div className="absolute inset-0 z-10" style={{ clipPath: `inset(0 0 0 ${position}%)` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-accent/25 via-card-hover to-bg" />
        {!missing && (
          <video
            ref={editedRef}
            className="absolute inset-0 h-full w-full object-cover"
            src={videos.edited}
            preload="none"
            playsInline
          />
        )}
      </div>

      {/* Shared play/pause for both videos; hidden when files are absent */}
      {!missing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? pauseLabel : playLabel}
          className={`absolute left-1/2 top-1/2 z-40 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-all duration-300 hover:shadow-glow-lg ${
            playing ? 'opacity-60 hover:opacity-100' : ''
          }`}
        >
          {loading ? (
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-bg border-t-transparent"
            />
          ) : playing ? (
            <PauseIcon className="h-5 w-5" />
          ) : (
            <PlayIcon className="h-5 w-5" />
          )}
        </button>
      )}

      {/* Drag happens ONLY on this handle group (24px strip along the
          divider + a 44px knob, sitting below the center play button),
          never on the card itself. Once grabbed, the window listeners
          track the drag across the full width. */}
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
        {/* Soft yellow falloff on each side of the divider (~28px each way) so
            the split reads as intentional design, strongest at the 50% rest
            and easing off as the handle is dragged toward either edge. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-14 -translate-x-1/2"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255,214,10,0.20), transparent)',
            opacity: 1 - Math.min(1, Math.abs(position - 50) / 50) * 0.5,
          }}
        />
        {/* Divider line, visual only */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent shadow-glow-lg"
        />
        {/* Knob: 44px hit area, one gentle pulse when the row first appears */}
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-[70%] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow-lg ${
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

      {/* Labels pinned above everything, always visible with strong contrast */}
      <span className="pointer-events-none absolute left-3 top-3 z-40 rounded-full border border-border-warm-strong bg-bg/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-heading">
        {rawLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-40 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg shadow-glow-sm">
        {editedLabel}
      </span>
    </div>
  )
}

export default function BeforeAfter() {
  // Mobile playback: the comparison rows stay INLINE on mobile. Unlike the
  // Portfolio Drive embeds, these are self-hosted MP4s in bare <video> elements
  // with no native controls (a single custom play button), so there is no player
  // chrome to overflow the card — and the drag slider IS the point, which a
  // fullscreen lightbox would remove. The <video>s carry playsInline so iOS
  // plays them in place instead of hijacking into its native fullscreen player;
  // audio follows the slider. So no lightbox here (audit part 5).
  const { t } = useLanguage()
  const items = t('beforeAfter.items')

  return (
    <section id="results" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
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
                  videos={ROW_VIDEOS[i] ?? {}}
                  rawLabel={t('beforeAfter.raw')}
                  editedLabel={t('beforeAfter.edited')}
                  playLabel={t('beforeAfter.play')}
                  pauseLabel={t('beforeAfter.pause')}
                />
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
