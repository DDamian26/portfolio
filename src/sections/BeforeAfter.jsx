import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import PlayIcon from '../components/PlayIcon'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'
import { setLightSpill } from '../lib/lightSpill'
import { claimPlayback, releasePlayback } from '../lib/videoBus'

// Single config object for the three comparison rows, in row order
// (Color & framing, Pacing & graphics, Sound & emphasis). Edit paths here;
// files live in /public/videos/. A row whose files are missing renders a
// graceful placeholder, never a broken player or blank black card.
const ROW_VIDEOS = [
  { raw: '/videos/color-raw.mp4', edited: '/videos/color-edited.mp4' },
  { raw: '/videos/pacing-raw.mp4', edited: '/videos/pacing-edited.mp4' },
  { raw: '/videos/sound-raw.mp4', edited: '/videos/sound-edited.mp4' },
]

const BASE_VOLUME = 0.5
const DRIFT_TOLERANCE = 0.1 // seconds before the lagging video is re-synced
const CROSSFADE_BAND = 10 // audio crossfades across position 45..55

// iOS Safari/WebKit paints nothing for preload="metadata" on its own, leaving a
// black card. Appending the #t=0.001 media fragment forces WebKit to seek to
// (and therefore decode + paint) the first frame, so the still is visible on load.
// If this ever proves flaky on a device, supply per-row poster images instead.
const firstFrameSrc = (url) => (url ? `${url}#t=0.001` : url)

// Only one video plays at a time site-wide (Before/After rows + Portfolio
// shorts): starting one calls claimPlayback() to pause whatever was active.

function PauseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}

function SoundOffIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 5 6 9H2v6h4l5 4V5z" />
      <path d="M23 9l-6 6M17 9l6 6" />
    </svg>
  )
}

function ComparisonSlider({ videos, rawLabel, editedLabel, playLabel, pauseLabel, unmuteLabel }) {
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
  // soundOn: the gesture has unlocked audio and the slider-active side is
  // audible. needsUnmute: playback started but audio was blocked (iOS low-power
  // / autoplay policy), so a manual unmute control is offered instead.
  const [soundOn, setSoundOn] = useState(false)
  const [needsUnmute, setNeedsUnmute] = useState(false)
  // Measured pixel width of the card. Each half's <video> is sized to this
  // FULL card width (see the "split, not clip" model below), so the video is
  // never scaled — only the plain <div> around it is resized.
  const [cardWidth, setCardWidth] = useState(null)

  const setRefs = (el) => {
    containerRef.current = el
    nearRef.current = el
  }

  // TEMPORARY iOS DIAGNOSTIC — surfaces why a <video> fails to load/decode so
  // failures are identifiable in the console rather than silent black cards.
  // Remove once the black-card issue is confirmed fixed on device.
  const onVideoError = (side) => (e) => {
    const v = e.currentTarget
    const err = v.error
    console.error(
      `[BeforeAfter] ${side} <video> error:`,
      `code=${err ? err.code : 'n/a'}`,
      `message="${err && err.message ? err.message : ''}"`,
      `readyState=${v.readyState}`,
      `networkState=${v.networkState}`,
      `currentSrc=${v.currentSrc}`,
    )
    setMissing(true)
    setPlaying(false)
  }

  // ----- Measure the card width (for the full-width videos) -----
  // useLayoutEffect + ResizeObserver so the videos get the correct pixel width
  // before the browser paints (no flash) and stay correct on resize/rotate.
  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const measure = () => setCardWidth(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // ----- Auto-demo sweep -----
  // When the row enters view it plays a one-time sweep (12% -> 88%, pause,
  // -> 50%) so the transformation is visible with zero interaction. It ONLY
  // animates `position`, which drives the two container widths (LEFT = position%,
  // RIGHT = 100 - position%) — same behaviour and easing as before, now against
  // the split layout instead of a mask. It never calls play() on the videos:
  // there is no autoplay anywhere. The first user grab/keypress cancels it
  // permanently for this row.
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
    // Interactive light spill: tell the background to bloom a soft yellow glow
    // from this card's centre while the slider is in hand. The canvas ignores
    // it on mobile / reduced motion, so no need to gate here.
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
  // then this row switches to preload="metadata" and explicitly calls load().
  // The load() is required on iOS to actually fetch metadata after a preload
  // change; combined with the #t=0.001 src fragment it paints the first frame
  // (a visible still) instead of a black card. Full buffering waits for play. -----
  useEffect(() => {
    if (!isNear) return
    for (const video of [rawRef.current, editedRef.current]) {
      if (video && !video.error) {
        video.preload = 'metadata'
        video.load()
      }
    }
  }, [isNear])

  // ----- Audio follows the slider: whichever side holds more of the card
  // carries the audio at BASE_VOLUME, the other rides down to silence, with a
  // short crossfade around the midpoint. Gated on soundOn: until the gesture
  // has unlocked audio, both stay muted (iOS requires a user gesture first). -----
  useEffect(() => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited) return
    if (!soundOn) {
      raw.muted = true
      edited.muted = true
      return
    }
    raw.muted = false
    edited.muted = false
    const rawShare = Math.min(Math.max((position - (50 - CROSSFADE_BAND / 2)) / CROSSFADE_BAND, 0), 1)
    raw.volume = BASE_VOLUME * rawShare
    edited.volume = BASE_VOLUME * (1 - rawShare)
  }, [position, soundOn])

  const pauseBoth = useCallback(() => {
    rawRef.current?.pause()
    editedRef.current?.pause()
    setPlaying(false)
    setSoundOn(false) // re-mutes both via the audio effect; next play re-unlocks
    setNeedsUnmute(false)
    releasePlayback(pauseBoth)
  }, [])

  // ----- One shared play/pause for both videos.
  // CRITICAL for iOS: this handler is synchronous and calls play() on both
  // videos with NO await beforehand. An intervening await would drop the
  // user-gesture activation and WebKit would reject playback (the old
  // "button does nothing" bug). Both videos start muted (JSX attribute), so
  // the gesture-initiated play() is always permitted; the slider-active side
  // is unmuted only AFTER both play() promises resolve. -----
  const togglePlay = () => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited || missing) return
    if (playing) {
      pauseBoth()
      return
    }
    claimPlayback(pauseBoth) // pause every other player site-wide (incl. Portfolio)
    setLoading(true)
    raw.preload = 'auto'
    edited.preload = 'auto'
    // Keep muted for a gesture-safe start, sync both, then fire play() — all
    // synchronously, before any promise handler runs.
    raw.muted = true
    edited.muted = true
    const t = Math.min(raw.currentTime || 0, edited.currentTime || 0)
    raw.currentTime = t
    edited.currentTime = t
    Promise.all([raw.play(), edited.play()])
      .then(() => {
        // Both playing and the gesture unlocked audio: unmute the active side.
        setLoading(false)
        setPlaying(true)
        setSoundOn(true)
        setNeedsUnmute(false)
      })
      .catch(() => {
        // iOS low-power mode / autoplay policy rejected playback. Retry fully
        // muted so the visuals still play, and expose a manual unmute control
        // rather than leaving a dead button.
        raw.muted = true
        edited.muted = true
        Promise.all([raw.play(), edited.play()])
          .then(() => {
            setLoading(false)
            setPlaying(true)
            setSoundOn(false)
            setNeedsUnmute(true)
          })
          .catch(() => {
            // Genuinely could not play (not a missing file): return to a
            // tappable idle state so the button stays functional.
            setLoading(false)
            setPlaying(false)
            setSoundOn(false)
          })
      })
  }

  // Manual unmute: a fresh user gesture, so unmuting the active side is
  // permitted even after an autoplay-policy rejection.
  const manualUnmute = () => {
    setSoundOn(true)
    setNeedsUnmute(false)
  }

  // ----- Sync, loop-on-shorter-duration -----
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

    raw.addEventListener('timeupdate', onTime)
    edited.addEventListener('timeupdate', onTime)
    raw.addEventListener('ended', restartTogether)
    edited.addEventListener('ended', restartTogether)
    return () => {
      raw.removeEventListener('timeupdate', onTime)
      edited.removeEventListener('timeupdate', onTime)
      raw.removeEventListener('ended', restartTogether)
      edited.removeEventListener('ended', restartTogether)
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

  // Full card width for each half's video/gradient. Until measured, fall back
  // to 100% (only ever used for the pre-paint frame that never reaches screen).
  const fullWidth = cardWidth != null ? `${cardWidth}px` : '100%'

  return (
    // "SPLIT, NOT CLIP" — iOS-safe comparison mask.
    // The card holds two side-by-side <div>s: LEFT (raw) anchored to the card's
    // left edge with width = position%, RIGHT (edited) anchored to the right
    // edge with width = 100 - position%. Each holds a <video> sized to the FULL
    // card width and anchored to the same edge, so the two frames line up exactly
    // at the handle. Only the plain <div>s are resized; the videos are never
    // scaled, transformed, clipped by clip-path, or nested under a moving offset.
    // WebKit composites each <video> into its own box normally — the code path
    // iOS renders reliably. No clip-path / mask-image / transform / filter /
    // backdrop-filter / will-change / opacity anywhere between <body> and the
    // <video> tags (the row is intentionally NOT wrapped in the framer-motion
    // Reveal, which would apply exactly those).
    <div
      ref={setRefs}
      className="relative aspect-video select-none overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow"
    >
      {/* LEFT (RAW): anchored to the card's left edge, revealed up to the handle. */}
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${position}%` }}>
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-br from-muted/25 via-card to-bg"
          style={{ width: fullWidth }}
        />
        {!missing && (
          <video
            ref={rawRef}
            // max-w-none is required: Tailwind's preflight sets `video { max-width:
            // 100% }`, which would otherwise clamp the video back to the (narrow)
            // container width and defeat the full-card-width split.
            className="absolute inset-y-0 left-0 max-w-none object-cover"
            style={{ width: fullWidth }}
            src={firstFrameSrc(videos.raw)}
            preload="none"
            muted
            playsInline
            onError={onVideoError('raw')}
          />
        )}
      </div>

      {/* RIGHT (EDITED): anchored to the card's right edge, revealed from the handle. */}
      <div className="absolute inset-y-0 right-0 overflow-hidden" style={{ width: `${100 - position}%` }}>
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-br from-accent/25 via-card-hover to-bg"
          style={{ width: fullWidth }}
        />
        {!missing && (
          <video
            ref={editedRef}
            // max-w-none: see the RAW video above — preflight's video max-width
            // would otherwise clamp this back to the container width.
            className="absolute inset-y-0 right-0 max-w-none object-cover"
            style={{ width: fullWidth }}
            src={firstFrameSrc(videos.edited)}
            preload="none"
            muted
            playsInline
            onError={onVideoError('edited')}
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

      {/* Manual unmute: shown only when playback started but audio was blocked
          (iOS low-power / autoplay policy). A fresh tap unlocks the sound. */}
      {!missing && playing && needsUnmute && (
        <button
          type="button"
          onClick={manualUnmute}
          aria-label={unmuteLabel}
          className="absolute bottom-3 left-1/2 z-40 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-border-warm-strong bg-bg/85 text-heading shadow-glow-sm transition-colors duration-200 hover:text-accent"
        >
          <SoundOffIcon className="h-5 w-5" />
        </button>
      )}

      {/* Graceful placeholder when a row's files are missing/undecodable */}
      {missing && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <span className="rounded-full border border-border-warm bg-bg/90 px-4 py-2 text-sm text-muted">
            Coming soon
          </span>
        </div>
      )}

      {/* Drag happens ONLY on this handle group (24px strip along the
          divider + a 44px knob, sitting below the center play button), never on
          the card itself. The handle and its divider line sit above both videos
          at the slider %. Once grabbed, the window listeners track the drag
          across the full width. (The handle's own translate/scale are on this
          sibling of the videos, not on any ancestor of them.) */}
      {!missing && (
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
      )}

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
  // Mobile playback: the comparison rows stay INLINE on mobile. These are
  // self-hosted MP4s in bare <video> elements with a single custom play button,
  // so there is no player chrome to overflow the card — and the drag slider IS
  // the point, which a fullscreen lightbox would remove. The <video>s carry
  // playsInline so iOS plays them in place instead of hijacking into its native
  // fullscreen player; audio follows the slider.
  const { t } = useLanguage()
  const items = t('beforeAfter.items')

  return (
    <section id="results" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
      <SectionHeading section="beforeAfter" />

      <div className="mt-16 flex flex-col gap-14">
        {items.map((item, i) => {
          const captionRight = i % 2 === 1
          return (
            <div
              key={i}
              className={`grid items-center gap-6 lg:gap-10 ${
                captionRight ? 'lg:grid-cols-[2.2fr_1fr]' : 'lg:grid-cols-[1fr_2.2fr]'
              }`}
            >
              {/* Only the caption gets the scroll-in Reveal. The video cell is
                  intentionally OUTSIDE any framer-motion wrapper: Reveal animates
                  transform / opacity / will-change, and iOS Safari will not
                  reliably composite a <video> whose ancestor carries any of those
                  — the card would paint black. Keeping the card's ancestor chain
                  free of those properties is what makes the videos show on iOS. */}
              <Reveal className={captionRight ? 'lg:order-2 lg:text-right' : ''}>
                <h3 className="text-xl font-bold tracking-tight text-heading">{item.title}</h3>
                <p className="mt-2 leading-relaxed">{item.description}</p>
              </Reveal>
              <div className={captionRight ? 'lg:order-1' : ''}>
                <ComparisonSlider
                  videos={ROW_VIDEOS[i] ?? {}}
                  rawLabel={t('beforeAfter.raw')}
                  editedLabel={t('beforeAfter.edited')}
                  playLabel={t('beforeAfter.play')}
                  pauseLabel={t('beforeAfter.pause')}
                  unmuteLabel={t('beforeAfter.unmute')}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
