import { useEffect, useRef } from 'react'

// "The Edit Bay" background. A single fixed canvas behind all content renders
// the dark editing-suite metaphor, back to front:
//   Layer 2  Track lines — faint timeline lanes with scroll-parallaxed ticks.
//   Layer 4  Light leak  — a warm streak that sweeps once as each section enters.
//   Layer 5a Cursor lamp — a tight focused glow that follows the pointer.
//   Layer 3  Ghost waveform — a procedural audio silhouette along the bottom.
//   Layer 5b Dust — motes that drift and catch the cursor lamp against the black.
// One rAF loop, paused when the tab is hidden. Touch and reduced-motion users
// get a static pure-black frame with a single soft vignette (no loop). The
// timecode (Layer 1) is a separate DOM element, Timecode.jsx.
const TAU = Math.PI * 2
const CURSOR_RADIUS = 400 // tighter than the old arc: a lamp, not a sky
const LIGHT_RADIUS = 260 // px within which dust brightens and stirs
// Sections whose presence makes the ghost waveform taller/denser.
const VIDEO_SECTIONS = new Set(['work', 'results'])

// Small, fast seeded PRNG so the waveform is stable for the session.
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    // Motion layers run only on non-touch, motion-OK devices. Everyone else
    // gets a static black frame with a soft vignette.
    const motion = !reducedMotion && !isTouch

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = false
    let scrollY = 0
    let emaDt = 16 // rolling frame time for adaptive degradation
    let lastTime = 0

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false
    let particles = []

    // Ghost waveform state
    let bars = []
    let waveAmp = 0.5
    let waveTarget = 0.5
    const seed = Math.floor(Math.random() * 1e9)

    // Light leak: at most one at a time, once per section per session.
    let leak = null
    const leaked = new Set()
    const pendingTimers = new Map()
    let observer = null

    // Track lines: fixed lane heights, ticks drift at slightly different speeds.
    const TRACK_YS = [0.28, 0.52, 0.74]
    const TRACK_SPEEDS = [0.12, 0.22, 0.08]
    const TICK_SPACING = 90
    const BAR_W = 3
    const BAR_GAP = 3
    const WAVE_MAX = 24

    const buildBars = () => {
      const rnd = mulberry32(seed)
      const count = Math.ceil(width / (BAR_W + BAR_GAP))
      bars = new Array(count)
      // Smooth the noise a little so it reads like a waveform, not static.
      let prev = 0.5
      for (let i = 0; i < count; i++) {
        const t = 0.15 + rnd() * 0.85
        prev = prev * 0.6 + t * 0.4
        bars[i] = prev
      }
    }

    const spawnParticles = () => {
      if (!motion) {
        particles = []
        return
      }
      const count = Math.round(Math.min(46, Math.max(28, (width * height) / 45000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 1.8,
        baseAlpha: 0.03 + Math.random() * 0.06, // dimmer at rest on pure black
        driftX: (Math.random() - 0.5) * 0.16,
        driftY: -(0.04 + Math.random() * 0.14),
        vx: 0,
        vy: 0,
        phase: Math.random() * TAU,
      }))
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      target.x = cursor.x = width / 2
      target.y = cursor.y = height * 0.4
      buildBars()
      spawnParticles()
    }

    // ----- Static frame (touch / reduced motion): black + one soft vignette ---
    const drawVignette = () => {
      const cx = width / 2
      const cy = height / 2
      const g = ctx.createRadialGradient(
        cx,
        cy,
        Math.min(width, height) * 0.35,
        cx,
        cy,
        Math.max(width, height) * 0.75,
      )
      g.addColorStop(0, 'rgba(0, 0, 0, 0)')
      g.addColorStop(1, 'rgba(0, 0, 0, 0.25)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
    }
    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawVignette()
    }

    // ----- Layer 2: track lines with drifting ticks -----
    const drawTracks = () => {
      for (let i = 0; i < TRACK_YS.length; i++) {
        const y = Math.round(height * TRACK_YS[i]) + 0.5
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
        // Ticks drift with scroll; every 5th is a taller "major" tick.
        const off = (((scrollY * TRACK_SPEEDS[i]) % TICK_SPACING) + TICK_SPACING) % TICK_SPACING
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
        ctx.beginPath()
        for (let x = -off; x < width + TICK_SPACING; x += TICK_SPACING) {
          const major = Math.round((x + off) / TICK_SPACING) % 5 === 0
          const h = major ? 6 : 3
          const px = Math.round(x) + 0.5
          ctx.moveTo(px, y - h)
          ctx.lineTo(px, y + h)
        }
        ctx.stroke()
      }
    }

    // ----- Layer 4: light leak sweep -----
    const drawLeak = (time) => {
      if (!leak) return
      const p = (time - leak.born) / 1200
      if (p >= 1) {
        leak = null
        return
      }
      const env = Math.sin(p * Math.PI) * 0.07 // ~7% peak
      ctx.save()
      ctx.translate(width / 2, height / 2)
      ctx.rotate(-Math.PI / 6)
      const span = Math.hypot(width, height)
      const bandX = -span * 0.6 + p * span * 1.2
      const g = ctx.createLinearGradient(bandX - 240, 0, bandX + 240, 0)
      g.addColorStop(0, 'rgba(255, 214, 10, 0)')
      g.addColorStop(0.5, `rgba(255, 224, 92, ${env.toFixed(4)})`)
      g.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = g
      ctx.fillRect(-span / 2, -span / 2, span, span)
      ctx.restore()
    }

    // ----- Layer 5a: cursor lamp -----
    const drawCursorGlow = () => {
      const g = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, CURSOR_RADIUS)
      g.addColorStop(0, 'rgba(255, 214, 10, 0.06)')
      g.addColorStop(0.5, 'rgba(255, 214, 10, 0.025)')
      g.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
    }

    // ----- Layer 3: ghost waveform -----
    const drawWave = () => {
      waveAmp += (waveTarget - waveAmp) * 0.03 // ~1s ease
      const step = BAR_W + BAR_GAP
      ctx.fillStyle = 'rgba(210, 198, 170, 0.05)'
      for (let i = 0; i < bars.length; i++) {
        const x = i * step
        let lift = 0
        if (hasPointer) {
          const d = Math.abs(x - cursor.x)
          if (d < 120) lift = (1 - d / 120) * 8 // bar under the cursor lifts
        }
        const h = bars[i] * WAVE_MAX * waveAmp + lift
        ctx.fillRect(x, height - h, BAR_W, h)
      }
    }

    // ----- Layer 5b: dust -----
    const drawDust = (time) => {
      for (const p of particles) {
        let glow = 0
        if (hasPointer) {
          const dx = p.x - cursor.x
          const dy = p.y - cursor.y
          const dist = Math.hypot(dx, dy)
          if (dist < LIGHT_RADIUS && dist > 0.001) {
            glow = 1 - dist / LIGHT_RADIUS
            const push = glow * glow * 0.05
            p.vx += (dx / dist) * push
            p.vy += (dy / dist) * push
          }
        }
        p.vx *= 0.95
        p.vy *= 0.95
        const wanderX = Math.sin(time * 0.0004 + p.phase) * 0.05
        const wanderY = Math.cos(time * 0.0005 + p.phase) * 0.04
        p.x += p.driftX + p.vx + wanderX
        p.y += p.driftY + p.vy + wanderY
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        } else if (p.y > height + 8) {
          p.y = -8
        }
        if (p.x < -8) p.x = width + 8
        else if (p.x > width + 8) p.x = -8
        // Dramatic catch: near the lamp, motes brighten well above their rest.
        const alpha = Math.min(0.7, p.baseAlpha + glow * glow * 0.6)
        ctx.fillStyle = `rgba(255, 214, 10, ${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size + glow * 0.7, 0, TAU)
        ctx.fill()
      }
    }

    const frame = (time) => {
      // Adaptive degradation: if frames get expensive, shed dust before smoothness.
      if (lastTime) emaDt += (time - lastTime - emaDt) * 0.05
      lastTime = time
      if (emaDt > 22 && particles.length > 16) particles.length -= 4

      scrollY = window.scrollY || window.pageYOffset || 0
      cursor.x += (target.x - cursor.x) * 0.08
      cursor.y += (target.y - cursor.y) * 0.08

      ctx.clearRect(0, 0, width, height)
      drawTracks()
      drawLeak(time)
      if (hasPointer) drawCursorGlow()
      drawWave()
      drawDust(time)
      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !motion) return
      running = true
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
      lastTime = 0
    }
    const onVisibility = () => (document.hidden ? stop() : start())
    const onPointerMove = (e) => {
      hasPointer = true
      target.x = e.clientX
      target.y = e.clientY
    }
    const onResize = () => {
      resize()
      if (!motion) drawStatic()
    }

    // ----- Section observer: drives the waveform amplitude and one-shot leaks.
    const setupObserver = () => {
      const sections = document.querySelectorAll('main section[id]')
      if (!sections.length) return
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const id = e.target.id
            if (e.isIntersecting && e.intersectionRatio >= 0.5) {
              // Current section drives the waveform.
              waveTarget = VIDEO_SECTIONS.has(id) ? 1 : 0.45
              // Light leak: fire once per section, only after it stays >400ms,
              // and never while another leak is running.
              if (!leaked.has(id) && !pendingTimers.has(id)) {
                const timer = setTimeout(() => {
                  pendingTimers.delete(id)
                  if (!leaked.has(id) && !leak) {
                    leak = { born: performance.now() }
                    leaked.add(id)
                  }
                }, 420)
                pendingTimers.set(id, timer)
              }
            } else if (!e.isIntersecting) {
              const t = pendingTimers.get(id)
              if (t) {
                clearTimeout(t)
                pendingTimers.delete(id)
              }
            }
          }
        },
        { threshold: [0, 0.5] },
      )
      sections.forEach((s) => observer.observe(s))
    }

    resize()
    window.addEventListener('resize', onResize)

    if (!motion) {
      drawStatic()
    } else {
      window.addEventListener('pointermove', onPointerMove)
      document.addEventListener('visibilitychange', onVisibility)
      setupObserver()
      start()
    }

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      if (observer) observer.disconnect()
      pendingTimers.forEach((t) => clearTimeout(t))
      pendingTimers.clear()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
