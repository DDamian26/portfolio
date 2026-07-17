import { useEffect, useRef } from 'react'

// Fixed full-viewport canvas behind all content. One rAF loop draws, back to
// front: the horizon arc (very slowly parallaxing left/right), occasional soft
// light blooms that fade in and out one at a time, the cursor glow, and "dust
// in the light", tiny warm motes drifting upward that brighten and get stirred
// gently away when the cursor's light passes near them, then settle back.
// Reduced-motion users get a single static arc and no loop. Touch devices run
// the loop for the parallax arc only (no cursor glow, blooms or dust). The loop
// pauses while the tab is hidden.
const LIGHT_RADIUS = 300 // px within which dust brightens and stirs
const TAU = Math.PI * 2
const ARC_DRIFT = 30 // px the horizon arc drifts to each side
const ARC_PERIOD = 40000 // ms for one full left-right-left parallax loop

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    // Dust and light blooms are desktop-only flourishes; the parallax arc is
    // allowed on touch, and nothing animates under reduced motion.
    const allowDust = !reducedMotion && !isTouch

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = false

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false
    let particles = []
    // One soft light bloom at a time: fades in and out at a random spot, then
    // schedules the next after a pause. Timestamps share the rAF clock.
    let bloom = null
    let nextBloomTime = performance.now() + 5000 + Math.random() * 5000

    const spawnParticles = () => {
      // Motes are a desktop-only flourish; skip the field entirely otherwise.
      if (!allowDust) {
        particles = []
        return
      }
      // Sparse field scaled by viewport area, clamped to 30..50 motes.
      const count = Math.round(Math.min(50, Math.max(30, (width * height) / 40000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        baseAlpha: 0.1 + Math.random() * 0.15,
        driftX: (Math.random() - 0.5) * 0.18, // wider horizontal spread
        driftY: -(0.04 + Math.random() * 0.16), // more vertical range + speed variance
        vx: 0, // stir velocity from the cursor's light, decays each frame
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
      target.y = cursor.y = height * 0.35
      spawnParticles()
    }

    const drawArc = (offsetX = 0) => {
      // Horizon glow: a wide, heavily blurred arc of warm light above the hero.
      const cx = width / 2 + offsetX
      const cy = -height * 0.25
      const outer = Math.max(width * 0.85, 620)

      let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer)
      g.addColorStop(0, 'rgba(255, 214, 10, 0.16)')
      g.addColorStop(0.45, 'rgba(255, 214, 10, 0.05)')
      g.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)

      // A tighter, slightly brighter core so the arc reads as a light source.
      g = ctx.createRadialGradient(cx, cy, 0, cx, cy, outer * 0.55)
      g.addColorStop(0, 'rgba(255, 224, 92, 0.10)')
      g.addColorStop(1, 'rgba(255, 224, 92, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
    }

    const drawCursorGlow = () => {
      const g = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 600)
      g.addColorStop(0, 'rgba(255, 214, 10, 0.07)')
      g.addColorStop(0.5, 'rgba(255, 214, 10, 0.03)')
      g.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
    }

    const drawBloom = (x, y, alpha) => {
      // A soft, edgeless disc of warm light; a bounded fill keeps it cheap.
      const r = 280
      const g = ctx.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255, 224, 92, ${alpha})`)
      g.addColorStop(0.6, `rgba(255, 214, 10, ${alpha * 0.4})`)
      g.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = g
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }

    const updateBlooms = (time) => {
      if (bloom) {
        const age = time - bloom.born
        if (age >= bloom.life) {
          bloom = null
          nextBloomTime = time + 15000 + Math.random() * 10000 // 15..25s until the next
          return
        }
        // Sine envelope: fade in to a soft peak at mid-life, then back out.
        const env = Math.sin((age / bloom.life) * Math.PI)
        drawBloom(bloom.x, bloom.y, env * 0.04) // peak ~4% opacity
      } else if (time >= nextBloomTime) {
        bloom = {
          x: width * (0.15 + Math.random() * 0.7),
          y: height * (0.12 + Math.random() * 0.6), // upper field, where the light lives
          born: time,
          life: 6000 + Math.random() * 4000, // 6..10s in and out
        }
      }
    }

    const drawDust = (time) => {
      for (const p of particles) {
        // How lit this mote is: 1 at the cursor, 0 at LIGHT_RADIUS and beyond.
        let glow = 0
        if (hasPointer) {
          const dx = p.x - cursor.x
          const dy = p.y - cursor.y
          const dist = Math.hypot(dx, dy)
          if (dist < LIGHT_RADIUS && dist > 0.001) {
            glow = 1 - dist / LIGHT_RADIUS
            // The light stirs the air: a soft push away from the cursor.
            const push = glow * glow * 0.05
            p.vx += (dx / dist) * push
            p.vy += (dy / dist) * push
          }
        }

        // Stir velocity eases out so motes settle back into their drift.
        p.vx *= 0.95
        p.vy *= 0.95

        const wanderX = Math.sin(time * 0.0004 + p.phase) * 0.06
        const wanderY = Math.cos(time * 0.0005 + p.phase) * 0.05
        p.x += p.driftX + p.vx + wanderX
        p.y += p.driftY + p.vy + wanderY

        // Recycle motes that drift off any edge.
        if (p.y < -8) {
          p.y = height + 8
          p.x = Math.random() * width
        } else if (p.y > height + 8) {
          p.y = -8
        }
        if (p.x < -8) p.x = width + 8
        else if (p.x > width + 8) p.x = -8

        // Far from the light: barely visible. Near it: clearly brighter.
        const alpha = Math.min(0.8, p.baseAlpha + glow * glow * 0.55)
        ctx.fillStyle = `rgba(255, 214, 10, ${alpha.toFixed(3)})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size + glow * 0.6, 0, TAU)
        ctx.fill()
      }
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawArc()
    }

    const frame = (time) => {
      // Lerp toward the pointer for the trailing candlelight feel.
      cursor.x += (target.x - cursor.x) * 0.08
      cursor.y += (target.y - cursor.y) * 0.08

      ctx.clearRect(0, 0, width, height)
      // Very slow horizontal parallax on the arc: ±ARC_DRIFT over ARC_PERIOD.
      drawArc(Math.sin(time * (TAU / ARC_PERIOD)) * ARC_DRIFT)
      if (allowDust) updateBlooms(time)
      if (hasPointer) drawCursorGlow()
      if (allowDust) drawDust(time)
      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || reducedMotion) return
      running = true
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(rafId)
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const onPointerMove = (e) => {
      hasPointer = true
      target.x = e.clientX
      target.y = e.clientY
    }

    const onResize = () => {
      resize()
      if (reducedMotion) drawStatic()
    }

    resize()
    window.addEventListener('resize', onResize)

    if (reducedMotion) {
      drawStatic()
    } else {
      // Touch has no persistent pointer, so skip the cursor glow there and run
      // the loop purely for the parallax arc.
      if (!isTouch) window.addEventListener('pointermove', onPointerMove)
      document.addEventListener('visibilitychange', onVisibility)
      start()
    }

    return () => {
      stop()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  )
}
