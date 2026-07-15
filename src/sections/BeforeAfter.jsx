import { useCallback, useRef, useState } from 'react'
import Reveal from '../components/Reveal'
import SectionHeading from '../components/SectionHeading'
import { useLanguage } from '../i18n/LanguageContext'

// Draggable comparison slider. Placeholder gradient panels stand in for
// real before/after stills until the content pass.
function ComparisonSlider({ beforeLabel, afterLabel }) {
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
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      className="relative aspect-video cursor-ew-resize touch-none select-none overflow-hidden rounded-card border border-border-warm shadow-glow-sm outline-none transition-shadow duration-500 focus-visible:border-accent hover:shadow-glow"
    >
      {/* AFTER — full layer: graded, warm, lit */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/25 via-card-hover to-bg">
        <span className="rounded-full bg-accent px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-bg">
          {afterLabel}
        </span>
      </div>

      {/* BEFORE — clipped layer: flat, dim, unedited */}
      <div
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/25 via-card to-bg"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <span className="rounded-full border border-border-warm bg-bg/70 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-muted">
          {beforeLabel}
        </span>
      </div>

      {/* Handle */}
      <div
        className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-accent shadow-glow-lg"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-bg shadow-glow-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
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

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.12} className="flex flex-col gap-4">
            <ComparisonSlider beforeLabel={t('beforeAfter.before')} afterLabel={t('beforeAfter.after')} />
            <div>
              <h3 className="text-lg font-bold tracking-tight text-heading">{item.title}</h3>
              <p className="mt-1 text-sm leading-relaxed">{item.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
