import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import AccentText from '../components/AccentText'
import Badge from '../components/Badge'
import Reveal from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { setLightSpill } from '../lib/lightSpill'

const GLOW_BREATHING = { opacity: [0.12, 0.17, 0.12], scale: [1, 1.02, 1] }
const GLOW_HOVER     = { opacity: 0.22, scale: 1.05 }
const GLOW_RETURN    = { opacity: 0.12, scale: 1 }

export default function About() {
  const { t } = useLanguage()
  const paragraphs = t('about.paragraphs')
  const highlights = t('about.highlights')
  const reduced = useReducedMotion()

  // Scroll parallax
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const portraitY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-6, 6])

  // Portrait container ref for lightSpill coordinates
  const portraitRef = useRef(null)

  // Phase-based animation to avoid hover-exit fighting breathing keyframes
  const [phase, setPhase] = useState('breathing') // 'breathing' | 'hovering' | 'returning'
  const returnTimer = useRef(null)

  function handleMouseEnter() {
    clearTimeout(returnTimer.current)
    setPhase('hovering')
    if (portraitRef.current) {
      const r = portraitRef.current.getBoundingClientRect()
      setLightSpill(r.left + r.width / 2, r.top + r.height / 2, 1)
    }
  }

  function handleMouseLeave() {
    setPhase('returning')
    setLightSpill(0, 0, 0)
    returnTimer.current = setTimeout(() => setPhase('breathing'), 900)
  }

  useEffect(() => () => {
    clearTimeout(returnTimer.current)
    setLightSpill(0, 0, 0)
  }, [])

  // Glow animation config per phase
  const glowAnimate =
    phase === 'hovering'
      ? GLOW_HOVER
      : phase === 'returning'
        ? GLOW_RETURN
        : reduced
          ? { opacity: 0.13, scale: 1 }
          : GLOW_BREATHING

  const glowTransition =
    phase === 'hovering'
      ? { duration: 0.35, ease: 'easeOut' }
      : phase === 'returning'
        ? { duration: 0.85, ease: 'easeInOut' }
        : { duration: 8, ease: 'easeInOut', repeat: Infinity, repeatType: 'loop' }

  return (
    <section ref={sectionRef} id="about" className="mx-auto max-w-[1100px] px-6 pb-32 pt-4">
      <div className="grid items-center gap-14 lg:grid-cols-[2fr_3fr]">

        {/* Portrait column */}
        <Reveal>
          <motion.div style={{ y: portraitY }} className="flex justify-center">
            <div
              ref={portraitRef}
              className="relative"
              style={{
                width: 'clamp(240px, 36vw, 380px)',
                height: 'clamp(240px, 36vw, 380px)',
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Ambient key-light glow behind portrait */}
              <motion.div
                aria-hidden
                animate={glowAnimate}
                transition={glowTransition}
                style={{
                  position: 'absolute',
                  inset: '-25%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #ffd60a 0%, #ffd60a44 30%, transparent 70%)',
                  filter: 'blur(42px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Circle-cropped portrait */}
              <motion.div
                animate={phase === 'hovering' ? { scale: 1.015 } : { scale: 1 }}
                transition={
                  phase === 'hovering'
                    ? { type: 'spring', stiffness: 280, damping: 22 }
                    : { duration: 0.7, ease: 'easeInOut' }
                }
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(255, 214, 10, 0.18)',
                  boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 40px rgba(0,0,0,0.55)',
                }}
              >
                <img
                  src="/images/damian-portrait-brand.png"
                  alt={t('about.portraitAlt')}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    display: 'block',
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </motion.div>

              {/* Subtle inner rim light — thin yellow arc at top-left */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse at 28% 22%, rgba(255,214,10,0.10) 0%, transparent 55%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
            </div>
          </motion.div>
        </Reveal>

        {/* Text column */}
        <Reveal delay={0.15} className="flex flex-col items-start gap-5">
          <Badge>{t('about.badge')}</Badge>
          <h2 className="text-4xl font-extrabold tracking-tight text-heading sm:text-5xl">
            <AccentText text={t('about.title')} />
          </h2>
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className={`text-lg leading-relaxed ${i === paragraphs.length - 1 ? 'font-semibold text-heading' : ''}`}
            >
              {p}
            </p>
          ))}

          <div className="mt-4 flex flex-wrap gap-3">
            {highlights.map((label) => (
              <span
                key={label}
                className="rounded-full border border-border-warm bg-accent/5 px-4 py-2 text-sm font-semibold text-body"
              >
                {label}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
