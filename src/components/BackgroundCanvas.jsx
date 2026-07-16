import { useEffect, useRef } from 'react'

// Fixed full-viewport canvas behind all content. One rAF loop draws three
// layers: the static horizon arc, the cursor glow, and "dust in the light":
// tiny warm motes drifting slowly (slight upward bias) that brighten and get
// stirred gently away when the cursor's light passes near them, then settle
// back to their drift. Touch devices and reduced-motion users get the static
// arc only, with no animation loop. The loop pauses while the tab is hidden.
const LIGHT_RADIUS = 300 // px within which dust brightens and stirs
const TAU = Math.PI * 2

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const isStatic =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = false

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false
    let particles = []

    const spawnParticles = () => {
      // Sparse field scaled by viewport area, clamped to 30..50 motes.
      const count = Math.round(Math.min(50, Math.max(30, (width * height) / 40000)))
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 1 + Math.random() * 2,
        baseAlpha: 0.1 + Math.random() * 0.15,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: -(0.03 + Math.random() * 0.09), // slight upward bias
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

    const drawArc = () => {
      // Horizon glow: a wide, heavily blurred arc of warm light above the hero.
      const cx = width / 2
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

        const wander = Math.sin(time * 0.0004 + p.phase) * 0.05
        p.x += p.driftX + p.vx + wander
        p.y += p.driftY + p.vy

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
      drawArc()
      if (hasPointer) drawCursorGlow()
      drawDust(time)
      rafId = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || isStatic) return
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
      if (isStatic) drawStatic()
    }

    resize()
    window.addEventListener('resize', onResize)

    if (isStatic) {
      drawStatic()
    } else {
      window.addEventListener('pointermove', onPointerMove)
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
