import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useLanguage } from '../i18n/LanguageContext'
import { EASE } from '../lib/motion'

const SESSION_KEY = 'splash-played'

// "The Cut": a playhead line sweeps the viewport once and scrubs the name
// into existence letter by letter, timed to the line's position.
const SWEEP_DELAY = 0.3 // dark beat before the sweep starts
const SWEEP_DURATION = 0.7
const NAME_SPAN = 0.5 // the name occupies roughly the middle 50% of the viewport

// Inverse of cubic ease-in-out: horizontal position (0..1) → time fraction.
// Used so each letter appears exactly as the eased playhead crosses it.
const invEaseInOut = (p) => (p < 0.5 ? Math.cbrt(p / 4) : 1 - Math.cbrt(2 * (1 - p)) / 2)

const letterDelay = (i, count) => {
  const fraction = 0.5 + (i / Math.max(count - 1, 1) - 0.5) * NAME_SPAN
  return SWEEP_DELAY + SWEEP_DURATION * invEaseInOut(fraction)
}

export default function Splash() {
  const { t } = useLanguage()
  const reduceMotion = useReducedMotion()

  // Decided once on mount: the intro plays one time per session; repeat
  // visits and reduced-motion users get the settled state with a quick fade.
  // Language switches re-render but never remount, so it can't replay.
  const [mode] = useState(() =>
    reduceMotion || sessionStorage.getItem(SESSION_KEY) ? 'settled' : 'cut',
  )
  const [showPlayhead, setShowPlayhead] = useState(mode === 'cut')
  const isCut = mode === 'cut'

  useEffect(() => {
    if (isCut) sessionStorage.setItem(SESSION_KEY, '1')
  }, [isCut])

  const name = t('splash.name')
  const letters = useMemo(() => name.split(''), [name])

  const dotDelay = isCut ? SWEEP_DELAY + SWEEP_DURATION + 0.05 : 0.05
  const sloganDelay = isCut ? dotDelay + 0.25 : 0.15
  const cueDelay = isCut ? sloganDelay + 0.25 : 0.3

  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      {/* Playhead — removed from the DOM once the sweep completes */}
      {showPlayhead && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none fixed inset-y-0 left-0 z-30 w-0.5 bg-accent shadow-glow-lg"
          initial={{ x: '-2vw' }}
          animate={{ x: '102vw' }}
          transition={{ delay: SWEEP_DELAY, duration: SWEEP_DURATION, ease: 'easeInOut' }}
          onAnimationComplete={() => setShowPlayhead(false)}
        />
      )}

      <div className="flex flex-col items-center gap-7">
        {/* Single line at every width: the font scales down instead of wrapping */}
        <h1
          aria-label={name}
          className="whitespace-nowrap text-[clamp(2.4rem,10vw,7.5rem)] font-black tracking-tight text-heading"
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              aria-hidden="true"
              className="inline-block"
              initial={isCut ? { opacity: 0, x: -14 } : { opacity: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                isCut
                  ? { delay: letterDelay(i, letters.length), duration: 0.22, ease: 'easeOut' }
                  : { delay: 0.05, duration: 0.4 }
              }
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
          {/* The period lands last with a spring overshoot, like a cut locking in */}
          <motion.span
            aria-hidden="true"
            className="inline-block text-accent drop-shadow-glow"
            initial={isCut ? { scale: 0 } : { opacity: 0 }}
            animate={isCut ? { scale: 1 } : { opacity: 1 }}
            transition={
              isCut
                ? { delay: dotDelay, type: 'spring', stiffness: 500, damping: 14 }
                : { delay: 0.05, duration: 0.4 }
            }
          >
            .
          </motion.span>
        </h1>

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
