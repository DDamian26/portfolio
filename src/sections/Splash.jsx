import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { EASE } from '../lib/motion'

const SESSION_KEY = 'splash-played'

// "The Timeline": the splash assembles like an edit being rendered.
// Dark beat, tracks fade in, clips snap into a rough cut left to right,
// then a playhead sweeps the cut and renders it into the name: each clip
// it crosses dissolves upward exactly as the letters in that zone rise
// into place. Dot lands on a spring, slogan and scroll cue follow.
//
// Absolute timings (seconds from mount), total sequence ~2.45s:
const DARK_BEAT = 0.2
const CLIPS_START = 0.45
const CLIP_STAGGER = 0.08
const SNAP_DUR = 0.18
const SWEEP_START = 1.15
const SWEEP_DUR = 0.5
const DISSOLVE_DUR = 0.25
const DOT_DELAY = SWEEP_START + SWEEP_DUR + 0.05
const RIG_REMOVE_MS = 2000 // all timeline elements leave the DOM here

// Clip layouts as percent left/width per track.
// Desktop: 3 tracks, 8 clips. Mobile: 2 tracks, 5 clips.
const DESKTOP_TRACKS = [
  [{ l: 2, w: 16 }, { l: 22, w: 26 }, { l: 52, w: 20 }],
  [{ l: 8, w: 22 }, { l: 36, w: 14 }, { l: 56, w: 30 }],
  [{ l: 0, w: 12 }, { l: 30, w: 18 }],
]
const MOBILE_TRACKS = [
  [{ l: 2, w: 24 }, { l: 32, w: 30 }, { l: 68, w: 22 }],
  [{ l: 10, w: 28 }, { l: 48, w: 26 }],
]

// Dim yellows and warm browns, cycled across clips.
const CLIP_TINTS = ['bg-accent/25', 'bg-muted/40', 'bg-accent/15', 'bg-card-hover']

// Flatten tracks and assign each clip a left-to-right snap time and the
// moment the playhead reaches its center (its dissolve cue).
function buildClips(tracks) {
  const flat = tracks.flatMap((clips, trackIdx) => clips.map((c) => ({ ...c, trackIdx })))
  ;[...flat]
    .sort((a, b) => a.l - b.l)
    .forEach((clip, i) => {
      clip.snapAt = CLIPS_START + i * CLIP_STAGGER
      clip.dissolveAt = SWEEP_START + SWEEP_DUR * ((clip.l + clip.w / 2) / 100)
    })
  return flat
}

// One keyframe timeline per clip: hidden, snap-settle on impact, hold,
// dissolve upward as the playhead crosses it. Transform/opacity only.
function clipAnimation(clip) {
  const end = clip.dissolveAt + DISSOLVE_DUR
  const duration = end - clip.snapAt
  const tSnap = SNAP_DUR / duration
  const tHold = (clip.dissolveAt - clip.snapAt) / duration
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 1, 1, 0],
      y: [-12, 0, 0, -18],
      scale: [1.18, 1, 1, 0.92],
    },
    transition: {
      delay: clip.snapAt,
      duration,
      times: [0, tSnap, tHold, 1],
      ease: ['easeOut', 'linear', 'easeIn'],
    },
  }
}

export default function Splash() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()

  // Decided once on mount: the intro plays one time per session; repeat
  // visits and reduced-motion users get the settled state with a quick fade.
  // Language switches re-render but never remount, so it can't replay.
  const [mode] = useState(() => {
    let played = false
    try {
      played = Boolean(sessionStorage.getItem(SESSION_KEY))
    } catch {
      /* storage blocked: treat as first visit */
    }
    return reduceMotion || played ? 'settled' : 'timeline'
  })
  const isTimeline = mode === 'timeline'
  const [rigVisible, setRigVisible] = useState(isTimeline)
  const [rigWidth, setRigWidth] = useState(0)
  const rigRef = useRef(null)

  // Simplified rig on small screens, chosen once at mount.
  const [tracks] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640 ? MOBILE_TRACKS : DESKTOP_TRACKS,
  )
  const clips = useMemo(() => buildClips(tracks), [tracks])

  useEffect(() => {
    if (!isTimeline) return
    try {
      sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* storage blocked: the intro may replay next visit, nothing breaks */
    }
    const timer = setTimeout(() => setRigVisible(false), RIG_REMOVE_MS)
    return () => clearTimeout(timer)
  }, [isTimeline])

  // Playhead sweeps in pixels, so measure the name block once it exists.
  useLayoutEffect(() => {
    if (rigVisible && rigRef.current) setRigWidth(rigRef.current.offsetWidth)
  }, [rigVisible])

  const name = t('splash.name')
  const letters = useMemo(() => name.split(''), [name])
  const letterDelay = (i) => SWEEP_START + SWEEP_DUR * (i / Math.max(letters.length - 1, 1))

  const sloganDelay = isTimeline ? DOT_DELAY + 0.2 : 0.15
  const cueDelay = isTimeline ? sloganDelay + 0.2 : 0.3

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <div className="flex w-full flex-col items-center gap-7">
        {/* The rig wrapper spans exactly the rendered name, so tracks,
            clips, playhead, and letters all share one horizontal zone. */}
        <div ref={rigRef} className="relative mx-auto">
          {rigVisible && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col gap-1.5 sm:gap-2"
            >
              {tracks.map((trackClips, trackIdx) => (
                <motion.div
                  key={trackIdx}
                  className="relative h-3 rounded border border-border-warm bg-accent/[0.03] sm:h-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0.8, 0] }}
                  transition={{
                    delay: DARK_BEAT + trackIdx * 0.06,
                    duration: SWEEP_START + SWEEP_DUR - DARK_BEAT + 0.15,
                    times: [0, 0.15, 0.65, 1],
                  }}
                >
                  {trackClips.map((clip, clipIdx) => {
                    const flatClip = clips.find(
                      (c) => c.trackIdx === trackIdx && c.l === clip.l && c.w === clip.w,
                    )
                    const anim = clipAnimation(flatClip)
                    return (
                      <motion.div
                        key={clipIdx}
                        className={`absolute inset-y-0 rounded border border-border-warm ${
                          CLIP_TINTS[(trackIdx * 3 + clipIdx) % CLIP_TINTS.length]
                        }`}
                        style={{ left: `${clip.l}%`, width: `${clip.w}%` }}
                        {...anim}
                      />
                    )
                  })}
                </motion.div>
              ))}
            </div>
          )}

          {/* Single line at every width: the font scales down instead of wrapping */}
          <h1
            aria-label={name}
            className="relative whitespace-nowrap text-[clamp(2.4rem,10vw,7.5rem)] font-black tracking-tight text-heading"
          >
            {letters.map((char, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="inline-block"
                initial={isTimeline ? { opacity: 0, y: 16 } : { opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  isTimeline
                    ? { delay: letterDelay(i), duration: 0.2, ease: 'easeOut' }
                    : { delay: 0.05, duration: 0.4 }
                }
              >
                {char === ' ' ? ' ' : char}
              </motion.span>
            ))}
            {/* The dot lands last with a spring overshoot, like a render finishing */}
            <motion.span
              aria-hidden="true"
              className="inline-block text-accent drop-shadow-glow"
              initial={isTimeline ? { scale: 0 } : { opacity: 0 }}
              animate={isTimeline ? { scale: 1 } : { opacity: 1 }}
              transition={
                isTimeline
                  ? { delay: DOT_DELAY, type: 'spring', stiffness: 500, damping: 14 }
                  : { delay: 0.05, duration: 0.4 }
              }
            >
              .
            </motion.span>
          </h1>

          {/* Playhead: one linear sweep across the rig, driving the render */}
          {rigVisible && rigWidth > 0 && (
            <motion.div
              aria-hidden="true"
              className="absolute -inset-y-4 left-0 w-0.5 bg-accent shadow-glow-lg sm:-inset-y-6"
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: rigWidth, opacity: [0, 1, 1, 0] }}
              transition={{
                x: { delay: SWEEP_START, duration: SWEEP_DUR, ease: 'linear' },
                opacity: {
                  delay: SWEEP_START - 0.05,
                  duration: SWEEP_DUR + 0.15,
                  times: [0, 0.1, 0.85, 1],
                },
              }}
            />
          )}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sloganDelay, duration: 0.45, ease: EASE }}
          className="max-w-2xl text-xl leading-relaxed sm:text-2xl"
        >
          {t('splash.slogan')}
        </motion.p>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: cueDelay, duration: 0.4 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-muted/80 transition-colors duration-300 hover:text-accent"
      >
        {t('splash.scroll')}
        <motion.svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <path d="M5 9l7 7 7-7" />
        </motion.svg>
      </motion.a>
    </section>
  )
}
