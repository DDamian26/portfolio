import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import PlayIcon from '../components/PlayIcon'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'
import useNearViewport from '../lib/useNearViewport'
import { claimPlayback, releasePlayback } from '../lib/videoBus'

// Local MP4 pairs for the three comparison rows, in row order.
// Drop files into /public/videos/; rows with missing pairs show a warm placeholder.
const ROW_VIDEOS = [
  { raw: '/videos/color-raw.mp4', edited: '/videos/color-edited.mp4' },
  { raw: '/videos/pacing-raw.mp4', edited: '/videos/pacing-edited.mp4' },
  { raw: '/videos/sound-raw.mp4', edited: '/videos/sound-edited.mp4' },
]

const BASE_VOLUME = 0.5
const SWEEP_DURATION = 500  // ms
const HOLD_BEFORE_SWEEP = 100  // ms — hold last frame before sweep starts

// ─── Icons ────────────────────────────────────────────────────────────────────
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

// ─── ComparisonCard ───────────────────────────────────────────────────────────
// Universal single-video comparison card with cut-reveal transition.
// One <video> element plays whichever side is active (RAW or EDITED).
// Switching sides triggers a yellow playhead sweep matching the splash intro.
// prefers-reduced-motion: instant opacity cross-fade, no sweep.
function ComparisonCard({ videos, rawLabel, editedLabel, playLabel, pauseLabel, muteLabel, unmuteLabel }) {
  const reduceMotion = useReducedMotion()

  // ── Refs & DOM ──
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const playBtnRef = useRef(null)
  const [nearRef, isNear] = useNearViewport('100px')

  const setRefs = useCallback((el) => {
    containerRef.current = el
    nearRef.current = el
  }, [nearRef])

  // ── State (+ mirrored refs for rAF/timeout callbacks) ──
  const [activeSide, setActiveSideState] = useState('raw')
  const activeSideRef = useRef('raw')
  const setActiveSide = useCallback((v) => { activeSideRef.current = v; setActiveSideState(v) }, [])

  const [playing, setPlaying] = useState(false)

  const [muted, setMutedState] = useState(true)
  const mutedRef = useRef(true)
  const setMuted = useCallback((v) => { mutedRef.current = v; setMutedState(v) }, [])

  // Gesture unlock: once user has tapped play, programmatic play() works on the same element
  const unlockedRef = useRef(false)

  const [sweeping, setSweepingState] = useState(false)
  const sweepingRef = useRef(false)
  const setSweeping = useCallback((v) => { sweepingRef.current = v; setSweepingState(v) }, [])

  const [sweepLeft, setSweepLeft] = useState(0)   // 0–100%

  // Opacity used only for the reduced-motion dissolve path
  const [videoOpacity, setVideoOpacity] = useState(1)

  const [missing, setMissing] = useState(false)

  const sweepRafRef = useRef(null)
  const holdTimerRef = useRef(null)

  // ── Magnetic play button ──
  const magX = useMotionValue(0)
  const magY = useMotionValue(0)
  const springX = useSpring(magX, { stiffness: 320, damping: 22 })
  const springY = useSpring(magY, { stiffness: 320, damping: 22 })

  const onPlayPointerMove = useCallback((e) => {
    if (reduceMotion || e.pointerType !== 'mouse' || !playBtnRef.current) return
    const rect = playBtnRef.current.getBoundingClientRect()
    magX.set(((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * 8)
    magY.set(((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * 8)
  }, [reduceMotion, magX, magY])

  const resetMag = useCallback(() => { magX.set(0); magY.set(0) }, [magX, magY])

  // ── Init ──
  useEffect(() => {
    const v = videoRef.current
    if (v) { v.muted = true; v.volume = BASE_VOLUME }
  }, [])

  // Lazy load: switch to preload=auto when the card enters vicinity
  useEffect(() => {
    if (!isNear || !videoRef.current) return
    videoRef.current.preload = 'auto'
  }, [isNear])

  // ── Playback helpers ──
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

  useEffect(() => () => {
    cancelAnimationFrame(sweepRafRef.current)
    clearTimeout(holdTimerRef.current)
    releasePlayback(pausePlayback)
  }, [pausePlayback])

  // ── Core: switch active side ──
  const switchSide = useCallback((newSide) => {
    if (sweepingRef.current || newSide === activeSideRef.current) return

    const dir = newSide === 'edited' ? 'forward' : 'reverse'
    const v = videoRef.current

    if (v && !v.paused) { v.pause(); setPlaying(false) }

    const doSwap = () => {
      const src = (newSide === 'raw' ? videos.raw : videos.edited) ?? ''
      if (v && src) {
        v.src = src + '#t=0.001'
        v.load()
        if (unlockedRef.current) {
          v.muted = mutedRef.current
          v.volume = BASE_VOLUME
          v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        }
      }
      setActiveSide(newSide)
    }

    if (reduceMotion) {
      // Fade out → swap → fade in, no sweep
      setVideoOpacity(0)
      holdTimerRef.current = setTimeout(() => {
        doSwap()
        setVideoOpacity(1)
      }, 130)
      return
    }

    // Yellow playhead sweep matching the splash intro
    setSweeping(true)
    setSweepLeft(dir === 'forward' ? 0 : 100)

    holdTimerRef.current = setTimeout(() => {
      const start = performance.now()
      const ease = (t) => t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2

      const tick = (now) => {
        const t = Math.min((now - start) / SWEEP_DURATION, 1)
        setSweepLeft(dir === 'forward' ? ease(t) * 100 : (1 - ease(t)) * 100)
        if (t < 1) {
          sweepRafRef.current = requestAnimationFrame(tick)
        } else {
          doSwap()
          setSweeping(false)
        }
      }
      sweepRafRef.current = requestAnimationFrame(tick)
    }, HOLD_BEFORE_SWEEP)
  }, [videos, reduceMotion, setActiveSide, setSweeping, setMuted])

  // ── Play / pause ──
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || missing || sweepingRef.current) return
    if (playing) { pausePlayback(); return }

    if (!unlockedRef.current) {
      unlockedRef.current = true
      v.muted = false
      setMuted(false)
    }
    v.volume = BASE_VOLUME
    if (v.ended) v.currentTime = 0

    claimPlayback(pausePlayback)
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }, [playing, missing, pausePlayback, setMuted])

  // ── Mute toggle ──
  const toggleMute = useCallback(() => {
    const v = videoRef.current
    const next = !mutedRef.current
    if (v) v.muted = next
    setMuted(next)
  }, [setMuted])

  // ── Auto-advance: RAW ends → sweep to EDITED; EDITED ends → freeze ──
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

  // ── Diagnostic: surface encoding or network failures ──
  const onVideoError = useCallback((e) => {
    const v = e.currentTarget
    console.error('[BeforeAfter] Video load failed — check encoding/CORS/network:', {
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

  const videoStyle = reduceMotion
    ? { opacity: videoOpacity, transition: 'opacity 120ms ease' }
    : undefined

  return (
    <div
      ref={setRefs}
      className="relative aspect-video select-none overflow-hidden rounded-card border border-border-warm bg-card shadow-glow-sm transition-shadow duration-500 hover:shadow-glow"
    >
      {/* Card background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/25 via-card to-bg" />

      {/* Single video — one element, src swaps on side change */}
      {!missing && (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          src={(videos.raw ?? '') + '#t=0.001'}
          preload="none"
          playsInline
          style={videoStyle}
          onError={onVideoError}
        />
      )}

      {/* Yellow playhead sweep — w-0.5 + shadow-glow-lg matches the Splash intro playhead */}
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
      <div
        role="group"
        aria-label={`${rawLabel} / ${editedLabel}`}
        className="absolute left-1/2 top-3 z-40 flex -translate-x-1/2 items-center rounded-full border border-border-warm bg-bg/85 p-0.5"
      >
        {([['raw', rawLabel], ['edited', editedLabel]]).map(([side, label]) => (
          <button
            key={side}
            type="button"
            onClick={() => switchSide(side)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') switchSide('raw')
              if (e.key === 'ArrowRight') switchSide('edited')
            }}
            disabled={sweeping}
            aria-pressed={activeSide === side}
            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors duration-200 ${
              activeSide === side
                ? 'bg-accent text-bg shadow-glow-sm'
                : 'cursor-pointer text-muted hover:bg-white/10 hover:text-body'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Magnetic play / pause button — outer div centres; motion.button adds magnetic drift */}
      {!missing && (
        <div className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2">
          <motion.button
            ref={playBtnRef}
            type="button"
            onClick={togglePlay}
            disabled={sweeping}
            onPointerMove={onPlayPointerMove}
            onPointerLeave={resetMag}
            style={{ x: springX, y: springY }}
            aria-label={playing ? pauseLabel : playLabel}
            className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-all duration-300 hover:shadow-glow-lg ${
              playing ? 'opacity-60 hover:opacity-100' : ''
            }`}
          >
            {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </motion.button>
        </div>
      )}

      {/* Bottom-left: corner label — always shows which side is active */}
      <span className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-full border border-border-warm-strong bg-bg/85 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-heading">
        {activeSide === 'raw' ? rawLabel : editedLabel}
      </span>

      {/* Bottom-right: mute / unmute */}
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
                <ComparisonCard
                  videos={ROW_VIDEOS[i] ?? {}}
                  rawLabel={t('beforeAfter.raw')}
                  editedLabel={t('beforeAfter.edited')}
                  playLabel={t('beforeAfter.play')}
                  pauseLabel={t('beforeAfter.pause')}
                  muteLabel={t('beforeAfter.mute')}
                  unmuteLabel={t('beforeAfter.unmute')}
                />
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
