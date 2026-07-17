import { useEffect, useRef, useState } from 'react'

// Layer 1 of "The Edit Bay": a small monospace timecode pinned bottom-right that
// maps scroll progress to a plausible edit runtime (00:00:00:00 at the top,
// 00:04:20:00 at the bottom). The frame digits spin smoothly as you scrub,
// forward or backward. It writes straight to the DOM node each frame so there is
// no React re-render churn. Decorative: pointer-events none except the text
// itself, which carries a title easter egg and brightens on hover. Hidden on
// mobile (CSS) and disabled entirely under reduced motion / touch.
const FPS = 24
const END_FRAMES = (4 * 60 + 20) * FPS // 00:04:20:00

const pad2 = (n) => String(n).padStart(2, '0')
function format(frames) {
  const f = Math.floor(frames % FPS)
  const totalSec = Math.floor(frames / FPS)
  return `${pad2(Math.floor(totalSec / 3600))}:${pad2(Math.floor(totalSec / 60) % 60)}:${pad2(totalSec % 60)}:${pad2(f)}`
}

export default function Timecode() {
  const ref = useRef(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = window.matchMedia('(pointer: coarse)').matches
    if (!reduced && !touch) setEnabled(true)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    let cur = 0
    let rafId = 0
    let running = true

    const targetFrames = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const p = Math.min(1, Math.max(0, (window.scrollY || 0) / max))
      return p * END_FRAMES
    }
    const tick = () => {
      const t = targetFrames()
      cur += (t - cur) * 0.18 // lerp so fast scrolls spin the frames smoothly
      if (Math.abs(t - cur) < 0.4) cur = t
      if (el) el.textContent = format(cur)
      rafId = requestAnimationFrame(tick)
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId)
        running = false
      } else if (!running) {
        running = true
        rafId = requestAnimationFrame(tick)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    rafId = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-4 right-4 z-40 hidden select-none font-mono text-xs tracking-wider md:block"
    >
      <span
        ref={ref}
        title="Now editing — scrub to taste"
        className="pointer-events-auto text-body opacity-30 transition-opacity duration-300 hover:opacity-70"
      >
        00:00:00:00
      </span>
    </div>
  )
}
