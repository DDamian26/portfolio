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
const DRIFT_TOLERANCE = 0.1
const CROSSFADE_BAND = 10

// ─── iOS detection ────────────────────────────────────────────────────────────
// WebKit on iOS (Safari, Chrome, and every other browser — they all use
// WKWebView) fails to composite stacked <video> elements with overflow:hidden,
// producing blank or flickering frames. Feature-probing the compositor at mount
// time requires gesture unlock and cross-origin canvas capture — both
// unavailable at cold start — so we fall back to CSS + UA detection.
// -webkit-touch-callout is iOS WebKit-only; the UA check covers old iPads and
// WKWebView apps that suppress the CSS property.
const isIOS = (() => {
  if (typeof window === 'undefined') return false
  try {
    if (typeof CSS !== 'undefined' && CSS.supports('-webkit-touch-callout', 'default')) return true
  } catch { /* CSS.supports may throw in unusual environments */ }
  return (
    /iP(hone|od|ad)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
})()

// ─── Shared helpers ───────────────────────────────────────────────────────────
function PauseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}

const waitReady = (video) =>
  new Promise((resolve, reject) => {
    if (video.error) return reject(video.error)
    if (video.readyState >= 3) return resolve()
    const ok = () => { cleanup(); resolve() }
    const bad = () => { cleanup(); reject(new Error('video failed to load')) }
    const cleanup = () => {
      video.removeEventListener('canplay', ok)
      video.removeEventListener('error', bad)
    }
    video.addEventListener('canplay', ok)
    video.addEventListener('error', bad)
    if (video.readyState === 0) video.load()
  })

// ─── iOS "Cut Reveal" component ───────────────────────────────────────────────
// Single <video> element; sides switch via a yellow-playhead sweep that matches
// the splash-screen intro animation. One play gesture unlocks auto-advance
// (RAW ends → sweep → EDITED autoplay) for the rest of the session.
function CutRevealSlider({ videos, rawLabel, editedLabel, playLabel, pauseLabel, muteLabel, unmuteLabel }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [nearRef, isNear] = useNearViewport('100px')

  // State + mirrored refs (refs used inside rAF / timeout callbacks where
  // stale state closures would produce wrong behavior)
  const [activeSide, setActiveSideState] = useState('raw')
  const activeSideRef = useRef('raw')
  const setActiveSide = useCallback((v) => { activeSideRef.current = v; setActiveSideState(v) }, [])

  const [playing, setPlaying] = useState(false)

  const [muted, setMutedState] = useState(true)
  const mutedRef = useRef(true)
  const setMuted = useCallback((v) => { mutedRef.current = v; setMutedState(v) }, [])

  const [unlocked, setUnlockedState] = useState(false)
  const unlockedRef = useRef(false)
  const setUnlocked = useCallback((v) => { unlockedRef.current = v; setUnlockedState(v) }, [])

  const [sweeping, setSweepingState] = useState(false)
  const sweepingRef = useRef(false)
  const setSweeping = useCallback((v) => { sweepingRef.current = v; setSweepingState(v) }, [])

  const [sweepLeft, setSweepLeft] = useState(0)  // 0–100, drives the line position
  const [missing, setMissing] = useState(false)

  const sweepRafRef = useRef(null)
  const holdTimerRef = useRef(null)

  const setRefs = useCallback((el) => {
    containerRef.current = el
    nearRef.current = el
  }, [nearRef])

  // Init video element muted state (React's muted prop is unreliable on iOS)
  useEffect(() => {
    const v = videoRef.current
    if (v) { v.muted = true; v.volume = BASE_VOLUME }
  }, [])

  // Lazy load: flip to preload=auto when near viewport
  useEffect(() => {
    if (!isNear || !videoRef.current) return
    videoRef.current.preload = 'auto'
  }, [isNear])

  // Pause/stop helper shared by intersection + visibility + unmount cleanup
  const pausePlayback = useCallback(() => {
    videoRef.current?.pause()
    setPlaying(false)
    releasePlayback(pausePlayback)
  }, [])

  useEffect(() => {
    const onVis = () => { if (document.hidden) pausePlayback() }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [pausePlayback])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (!e.isIntersecting) pausePlayback() }, { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pausePlayback])

  // Cleanup on unmount
  useEffect(() => () => {
    cancelAnimationFrame(sweepRafRef.current)
    clearTimeout(holdTimerRef.current)
    releasePlayback(pausePlayback)
  }, [pausePlayback])

  // Core: switch sides with yellow-playhead sweep
  const switchSide = useCallback((newSide) => {
    if (sweepingRef.current || newSide === activeSideRef.current) return

    const dir = newSide === 'edited' ? 'forward' : 'reverse'

    // Pause current video; hold last frame for ~100ms before sweep starts
    const v = videoRef.current
    if (v && !v.paused) { v.pause(); setPlaying(false) }

    setSweeping(true)
    setSweepLeft(dir === 'forward' ? 0 : 100)

    holdTimerRef.current = setTimeout(() => {
      const start = performance.now()
      const DURATION = 500
      const ease = (t) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2

      const tick = (now) => {
        const t = Math.min((now - start) / DURATION, 1)
        setSweepLeft(dir === 'forward' ? ease(t) * 100 : (1 - ease(t)) * 100)

        if (t < 1) {
          sweepRafRef.current = requestAnimationFrame(tick)
        } else {
          // Sweep complete: swap source and optionally autoplay
          const v = videoRef.current
          const src = newSide === 'raw' ? videos.raw : videos.edited
          if (v && src) {
            v.src = src + '#t=0.001'
            v.load()
            if (unlockedRef.current) {
              v.muted = mutedRef.current
              v.volume = BASE_VOLUME
              v.play()
                .then(() => setPlaying(true))
                .catch(() => setPlaying(false))
            }
          }
          setActiveSide(newSide)
          setSweeping(false)
        }
      }
      sweepRafRef.current = requestAnimationFrame(tick)
    }, 100)
  }, [videos, setActiveSide, setSweeping, setMuted])

  // Play / pause toggle
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || missing || sweepingRef.current) return

    if (playing) {
      pausePlayback()
      return
    }

    // First play = gesture unlock: unmute and allow future programmatic play
    if (!unlockedRef.current) {
      setUnlocked(true)
      v.muted = false
      setMuted(false)
    }
    v.volume = BASE_VOLUME

    // Re-play from start if the video already ended
    if (v.ended) v.currentTime = 0

    claimPlayback(pausePlayback)
    v.play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [playing, missing, pausePlayback, setUnlocked, setMuted])

  // Mute toggle (independent of play state)
  const toggleMute = useCallback(() => {
    const v = videoRef.current
    const next = !mutedRef.current
    if (v) v.muted = next
    setMuted(next)
  }, [setMuted])

  // Auto-advance: RAW ends → sweep to EDITED; EDITED ends → freeze on last frame
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onEnded = () => {
      if (activeSideRef.current === 'raw') {
        switchSide('edited')
      } else {
        setPlaying(false)
        releasePlayback(pausePlayback)
      }
    }
    v.addEventListener('ended', onEnded)
    return () => v.removeEventListener('ended', onEnded)
  }, [switchSide, pausePlayback])

  // Diagnostic: surface encoding/load failures rather than silently black card
  const onVideoError = useCallback((e) => {
    const v = e.currentTarget
    console.error('[BeforeAfter iOS] Video load failed — check encoding/CORS/network:', {
      src: v.src,
      readyState: v.readyState,
      networkState: v.networkState,
      errorCode: v.error?.code,
      errorMessage: v.error?.message,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
    })
    setMissing(true)
    setPlaying(false)
  }, [])

  const src0 = (videos.raw ?? '') + '#t=0.001'

  return (
    <div
      ref={setRefs}
      className="relative aspect-video select-none overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow"
    >
      {/* Card background gradient (matches desktop RAW side) */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-card to-bg" />

      {/* Single video — iOS compositor handles one element without issue */}
      {!missing && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={src0}
          preload="none"
          playsInline
          onError={onVideoError}
        />
      )}

      {/* Yellow playhead sweep — identical visual language to the splash intro.
          w-0.5 + shadow-glow-lg matches the splash's playhead className exactly. */}
      {sweeping && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-50 w-0.5 shadow-glow-lg"
          style={{
            left: `calc(${sweepLeft}% - 1px)`,
            background: 'var(--color-accent, #ffd60a)',
            boxShadow: '0 0 22px 14px rgba(255, 214, 10, 0.42)',
          }}
        />
      )}

      {/* Top-center RAW / EDITED toggle — styled like the nav language toggle */}
      <div className="absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center rounded-full border border-border-warm bg-bg/85 p-0.5">
        {([['raw', rawLabel], ['edited', editedLabel]]).map(([side, label]) => (
          <button
            key={side}
            type="button"
            onClick={() => switchSide(side)}
            disabled={sweeping}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
              activeSide === side
                ? 'bg-accent text-bg shadow-glow-sm'
                : 'text-muted hover:text-body'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Center play / pause button (same style as desktop slider) */}
      {!missing && (
        <button
          type="button"
          onClick={togglePlay}
          disabled={sweeping}
          aria-label={playing ? pauseLabel : playLabel}
          className={`absolute left-1/2 top-1/2 z-40 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-all duration-300 hover:shadow-glow-lg ${
            playing ? 'opacity-60 hover:opacity-100' : ''
          }`}
        >
          {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
        </button>
      )}

      {/* Bottom-left: corner label — always shows active side at a glance */}
      <span className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-full border border-border-warm-strong bg-bg/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-heading">
        {activeSide === 'raw' ? rawLabel : editedLabel}
      </span>

      {/* Bottom-right: mute / unmute toggle */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? unmuteLabel : muteLabel}
        className="absolute bottom-3 right-3 z-40 flex h-8 w-8 items-center justify-center rounded-full border border-border-warm bg-bg/85 text-heading transition-colors duration-200 hover:bg-accent hover:text-bg"
      >
        {muted ? <MuteIcon /> : <SpeakerIcon />}
      </button>
    </div>
  )
}

// ─── Desktop / Android split-frame slider ────────────────────────────────────
function ComparisonSlider({ videos, rawLabel, editedLabel, playLabel, pauseLabel }) {
  const containerRef = useRef(null)
  const rawRef = useRef(null)
  const editedRef = useRef(null)
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
      { from: 12, to: 88, dur: 2500 },
      { hold: 600 },
      { from: 88, to: 50, dur: 900 },
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
        if (elapsed >= seg.hold) { i += 1; segStart = null }
      } else {
        const t = Math.min(elapsed / seg.dur, 1)
        setPosition(seg.from + (seg.to - seg.from) * easeInOut(t))
        if (t >= 1) { i += 1; segStart = null }
      }
      if (i < seq.length) demo.current.raf = requestAnimationFrame(tick)
    }
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

  const onPointerDown = (e) => {
    e.preventDefault()
    cancelAutoDemo()
    const rect = containerRef.current.getBoundingClientRect()
    setLightSpill(rect.left + rect.width / 2, rect.top + rect.height / 2, 1)
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => updateFromClientX(e.clientX)
    const onUp = () => {
      setLightSpill(0, 0, 0)
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
    if (e.key === 'ArrowLeft') { cancelAutoDemo(); setPosition((p) => Math.max(3, p - 4)) }
    if (e.key === 'ArrowRight') { cancelAutoDemo(); setPosition((p) => Math.min(97, p + 4)) }
  }

  useEffect(() => {
    if (!isNear) return
    for (const video of [rawRef.current, editedRef.current]) {
      if (video && !video.error) video.preload = 'auto'
    }
  }, [isNear])

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

  const togglePlay = async () => {
    const raw = rawRef.current
    const edited = editedRef.current
    if (!raw || !edited || missing || loading) return
    if (playing) { pauseBoth(); return }
    claimPlayback(pauseBoth)
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
      const loopEnd = Math.min(raw.duration || Infinity, edited.duration || Infinity)
      if (Number.isFinite(loopEnd) && Math.max(raw.currentTime, edited.currentTime) >= loopEnd - 0.08) {
        restartTogether()
        return
      }
      const drift = raw.currentTime - edited.currentTime
      if (Math.abs(drift) > DRIFT_TOLERANCE) {
        if (drift > 0) edited.currentTime = raw.currentTime
        else raw.currentTime = edited.currentTime
      }
    }
    const onError = () => { setMissing(true); setPlaying(false) }

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

  useEffect(() => {
    const el = containerRef.current
    const observer = new IntersectionObserver(
      ([entry]) => { if (!entry.isIntersecting) pauseBoth() },
      { threshold: 0 },
    )
    if (el) observer.observe(el)
    const onVisibility = () => { if (document.hidden) pauseBoth() }
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

      {/* EDITED: overflow:hidden on a left-anchored container instead of clip-path —
          iOS Safari fails to composite <video> inside clip-path containers.
          Note: on iOS this component is never rendered (CutRevealSlider is used
          instead), so this comment is just for documentation. */}
      <div
        className="absolute top-0 bottom-0 right-0 z-10 overflow-hidden"
        style={{ left: `${position}%` }}
      >
        <div
          className="absolute top-0 bottom-0"
          style={{
            width: `${(100 / Math.max(100 - position, 0.1)) * 100}%`,
            left: `${-(position / Math.max(100 - position, 0.1)) * 100}%`,
          }}
        >
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
      </div>

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
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-14 -translate-x-1/2"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,214,10,0.20), transparent)',
            opacity: 1 - Math.min(1, Math.abs(position - 50) / 50) * 0.5,
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent shadow-glow-lg"
        />
        <span
          aria-hidden="true"
          className={`absolute left-1/2 top-[70%] flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow-lg ${
            isNear ? 'handle-pulse' : ''
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M8 6l-5 6 5 6M16 6l5 6-5 6" />
          </svg>
        </span>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 z-40 rounded-full border border-border-warm-strong bg-bg/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-heading">
        {rawLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 z-40 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-bg shadow-glow-sm">
        {editedLabel}
      </span>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export default function BeforeAfter() {
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
                {isIOS ? (
                  <CutRevealSlider
                    videos={ROW_VIDEOS[i] ?? {}}
                    rawLabel={t('beforeAfter.raw')}
                    editedLabel={t('beforeAfter.edited')}
                    playLabel={t('beforeAfter.play')}
                    pauseLabel={t('beforeAfter.pause')}
                    muteLabel={t('beforeAfter.mute')}
                    unmuteLabel={t('beforeAfter.unmute')}
                  />
                ) : (
                  <ComparisonSlider
                    videos={ROW_VIDEOS[i] ?? {}}
                    rawLabel={t('beforeAfter.raw')}
                    editedLabel={t('beforeAfter.edited')}
                    playLabel={t('beforeAfter.play')}
                    pauseLabel={t('beforeAfter.pause')}
                  />
                )}
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
