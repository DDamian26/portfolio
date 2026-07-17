import { useEffect, useRef } from 'react'

// "Cinematic luxury" background. A single fixed canvas behind all content paints
// the layer stack, bottom to top:
//   L1 Pure black base ....... the body background (#050505); the canvas clears.
//   L2 Spotlights ............ 2-3 very large, heavily blurred warm radial lights
//                              that give each section its mood (positions here are
//                              defaults; part 2 will drive them per section).
//   L3 Grid .................. an ultra-faint 64px grid, masked so it is visible
//                              only where the spotlights (and cursor lamp) fall.
//   L4 Film grain ............ warm noise at ~3%, shifting every few frames.
//   L5 Dust .................. motes that catch the light like dust in a beam.
//   (L6 content sits above, in <main>.)
// Plus the cursor "lamp": a tight focused light that reveals the room as it moves.
// One rAF loop, paused when hidden. Touch / reduced-motion get a single static
// frame (spotlights + grid + grain), no dust, no lamp, no loop.

const TAU = Math.PI * 2
const CELL = 64 // grid cell size in px
const LAMP_RADIUS = 140 // px halo; a small work lamp, not a floodlight
const HALO_BOX = 320 // offscreen size for the cursor's grid-reveal patch
const GRAIN_TILE = 128
const GRAIN_FRAMES = 3 // shift the grain every N frames, like real film

// Spotlight defaults, in viewport fractions. `w` is a weighting used only to
// build the illumination field that reveals grid + dust; `a` is draw opacity.
const SPOTS = [
  { xf: 0.5, yf: 0.1, r: 820, a: 0.05, w: 1.0 },
  { xf: 0.12, yf: 0.66, r: 680, a: 0.035, w: 0.8 },
  { xf: 0.9, yf: 0.44, r: 720, a: 0.03, w: 0.7 },
]

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const motion = !reducedMotion && !isTouch

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0
    let running = false
    let frameCount = 0
    let emaDt = 16
    let lastTime = 0

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false
    let overInteractive = false
    let focus = 1 // eased: 1 at rest, ~1.2 over interactive elements
    let haloScale = 1 // eased: 1 at rest, ~0.85 (tighter) over interactive

    let particles = []
    let lights = [] // resolved spotlight pixel positions

    // Offscreen layers
    const gridCanvas = document.createElement('canvas')
    const gridCtx = gridCanvas.getContext('2d')
    const haloCanvas = document.createElement('canvas')
    const haloCtx = haloCanvas.getContext('2d')
    let grainTiles = []
    let grainPatterns = []

    const resolveLights = () => {
      lights = SPOTS.map((s) => ({ x: s.xf * width, y: s.yf * height, r: s.r, a: s.a, w: s.w }))
    }

    // Illumination field 0..1 at a point: how lit it is by the spotlights and
    // (optionally) the moving cursor lamp. Drives dust visibility.
    const lightAt = (x, y, includeCursor) => {
      let v = 0
      for (const l of lights) {
        const d = Math.hypot(x - l.x, y - l.y)
        if (d < l.r) v += (1 - d / l.r) * l.w
      }
      if (includeCursor && hasPointer) {
        const d = Math.hypot(x - cursor.x, y - cursor.y)
        const rr = LAMP_RADIUS * haloScale * 1.6
        if (d < rr) v += (1 - d / rr) * 1.3 * focus
      }
      return v > 1 ? 1 : v
    }

    // ----- Layer 2: spotlights -----
    const drawSpots = () => {
      for (const l of lights) {
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
        g.addColorStop(0, `rgba(255, 214, 10, ${l.a})`)
        g.addColorStop(0.5, `rgba(255, 210, 40, ${(l.a * 0.35).toFixed(4)})`)
        g.addColorStop(1, 'rgba(255, 214, 10, 0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, width, height)
      }
    }

    // Draw a grid into a 2D context, aligned to the viewport grid, over a box.
    const strokeGrid = (c, ox, oy, w, h, alpha) => {
      c.strokeStyle = `rgba(255, 246, 224, ${alpha})`
      c.lineWidth = 1
      c.beginPath()
      let sx = -(((ox % CELL) + CELL) % CELL)
      for (let x = sx; x <= w; x += CELL) {
        const px = Math.round(x) + 0.5
        c.moveTo(px, 0)
        c.lineTo(px, h)
      }
      let sy = -(((oy % CELL) + CELL) % CELL)
      for (let y = sy; y <= h; y += CELL) {
        const py = Math.round(y) + 0.5
        c.moveTo(0, py)
        c.lineTo(w, py)
      }
      c.stroke()
    }

    // ----- Layer 3: build the static masked grid once (grid ∩ spotlights) -----
    const buildGrid = () => {
      gridCanvas.width = width
      gridCanvas.height = height
      gridCtx.clearRect(0, 0, width, height)
      strokeGrid(gridCtx, 0, 0, width, height, 0.05)
      // Keep the grid only where the spotlights are: multiply grid alpha by the
      // spotlight field so it fades to nothing in the dark.
      gridCtx.globalCompositeOperation = 'destination-in'
      for (const l of lights) {
        const g = gridCtx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
        g.addColorStop(0, `rgba(255,255,255,${Math.min(1, l.w)})`)
        g.addColorStop(1, 'rgba(255,255,255,0)')
        gridCtx.fillStyle = g
        gridCtx.fillRect(0, 0, width, height)
      }
      gridCtx.globalCompositeOperation = 'source-over'
    }

    // Cursor grid-reveal patch: brighter grid in a soft circle under the lamp.
    const drawHaloGrid = () => {
      const half = HALO_BOX / 2
      haloCtx.clearRect(0, 0, HALO_BOX, HALO_BOX)
      // Align the patch grid to the world grid.
      strokeGrid(haloCtx, cursor.x - half, cursor.y - half, HALO_BOX, HALO_BOX, 0.11 * focus)
      haloCtx.globalCompositeOperation = 'destination-in'
      const g = haloCtx.createRadialGradient(half, half, 0, half, half, half)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      haloCtx.fillStyle = g
      haloCtx.fillRect(0, 0, HALO_BOX, HALO_BOX)
      haloCtx.globalCompositeOperation = 'source-over'
      ctx.drawImage(haloCanvas, cursor.x - half, cursor.y - half)
    }

    // ----- Layer 4: film grain -----
    const buildGrain = () => {
      grainTiles = []
      grainPatterns = []
      for (let t = 0; t < 4; t++) {
        const c = document.createElement('canvas')
        c.width = GRAIN_TILE
        c.height = GRAIN_TILE
        const cc = c.getContext('2d')
        const img = cc.createImageData(GRAIN_TILE, GRAIN_TILE)
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random()
          img.data[i] = 255 // warm white noise
          img.data[i + 1] = 246
          img.data[i + 2] = 224
          img.data[i + 3] = v * v * 255 // sparse, weighted dim
        }
        cc.putImageData(img, 0, 0)
        grainTiles.push(c)
        grainPatterns.push(ctx.createPattern(c, 'repeat'))
      }
    }
    let grainIdx = 0
    let grainOff = { x: 0, y: 0 }
    const drawGrain = (animate) => {
      if (animate && frameCount % GRAIN_FRAMES === 0) {
        grainIdx = (grainIdx + 1) % grainPatterns.length
        grainOff = { x: (Math.random() * CELL) | 0, y: (Math.random() * CELL) | 0 }
      }
      ctx.save()
      ctx.globalAlpha = 0.03
      ctx.translate(-grainOff.x, -grainOff.y)
      ctx.fillStyle = grainPatterns[grainIdx]
      ctx.fillRect(0, 0, width + CELL, height + CELL)
      ctx.restore()
    }

    // ----- cursor lamp -----
    const drawLamp = () => {
      const r = LAMP_RADIUS * haloScale
      const halo = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, r)
      halo.addColorStop(0, `rgba(255, 224, 92, ${(0.09 * focus).toFixed(4)})`)
      halo.addColorStop(0.5, `rgba(255, 214, 10, ${(0.035 * focus).toFixed(4)})`)
      halo.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = halo
      ctx.fillRect(cursor.x - r, cursor.y - r, r * 2, r * 2)
      // small bright core
      const cr = 14
      const core = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, cr)
      core.addColorStop(0, `rgba(255, 236, 150, ${(0.3 * focus).toFixed(4)})`)
      core.addColorStop(1, 'rgba(255, 236, 150, 0)')
      ctx.fillStyle = core
      ctx.fillRect(cursor.x - cr, cursor.y - cr, cr * 2, cr * 2)
    }

    // ----- Layer 5: dust -----
    const spawnParticles = () => {
      if (!motion) {
        particles = []
        return
      }
      // ~40 on a desktop, scaled down on smaller viewports.
      const count = Math.round(Math.min(40, Math.max(16, (width * height) / 52000)))
      particles = Array.from({ length: count }, () => {
        const small = Math.random() ** 2.2 // weight sizes toward small
        const tier = Math.random() < 0.55 ? 0 : Math.random() < 0.8 ? 1 : 2
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1 + small * 3, // 1..4px, mostly small
          tier, // 0 sharp, 1 soft, 2 softer (depth planes)
          baseAlpha: 0.28 + Math.random() * 0.4,
          vx: (Math.random() - 0.5) * 0.05, // extremely slow independent drift
          vy: (Math.random() - 0.5) * 0.05,
          wobAmp: 0.15 + Math.random() * 0.35,
          wobSpeed: 0.0002 + Math.random() * 0.0004,
          phase: Math.random() * TAU,
        }
      })
    }

    const drawDust = (time) => {
      for (const p of particles) {
        p.x += p.vx + Math.sin(time * p.wobSpeed + p.phase) * p.wobAmp * 0.02
        p.y += p.vy + Math.cos(time * p.wobSpeed * 0.9 + p.phase) * p.wobAmp * 0.02
        if (p.x < -6) p.x = width + 6
        else if (p.x > width + 6) p.x = -6
        if (p.y < -6) p.y = height + 6
        else if (p.y > height + 6) p.y = -6
        // Visible where the light is; nearly invisible in the dark.
        const lit = lightAt(p.x, p.y, true)
        const alpha = p.baseAlpha * (0.04 + 0.96 * lit)
        if (alpha < 0.01) continue
        ctx.fillStyle = `rgba(255, 232, 150, ${alpha.toFixed(3)})`
        if (p.tier === 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, TAU)
          ctx.fill()
        } else {
          const rr = p.size * (p.tier === 1 ? 2.4 : 3.6)
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr)
          g.addColorStop(0, `rgba(255, 232, 150, ${(alpha * (p.tier === 1 ? 0.9 : 0.6)).toFixed(3)})`)
          g.addColorStop(1, 'rgba(255, 232, 150, 0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2)
        }
      }
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
      haloCanvas.width = HALO_BOX
      haloCanvas.height = HALO_BOX
      resolveLights()
      buildGrid()
      buildGrain()
      spawnParticles()
    }

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawSpots()
      ctx.drawImage(gridCanvas, 0, 0)
      drawGrain(false)
    }

    const frame = (time) => {
      frameCount += 1
      if (lastTime) emaDt += (time - lastTime - emaDt) * 0.05
      lastTime = time
      if (emaDt > 22 && particles.length > 14) particles.length -= 3

      cursor.x += (target.x - cursor.x) * 0.1
      cursor.y += (target.y - cursor.y) * 0.1
      const tf = overInteractive ? 1.2 : 1
      const ts = overInteractive ? 0.85 : 1
      focus += (tf - focus) * 0.12
      haloScale += (ts - haloScale) * 0.12

      ctx.clearRect(0, 0, width, height)
      drawSpots() // L2
      ctx.drawImage(gridCanvas, 0, 0) // L3 (masked static grid)
      if (hasPointer) drawHaloGrid() // L3 cursor reveal
      drawGrain(true) // L4
      if (hasPointer) drawLamp() // cursor lamp
      drawDust(time) // L5
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

    const INTERACTIVE = 'a, button, [role="slider"], article, input, label, summary'
    const onPointerMove = (e) => {
      hasPointer = true
      target.x = e.clientX
      target.y = e.clientY
      const el = document.elementFromPoint(e.clientX, e.clientY)
      overInteractive = !!(el && el.closest(INTERACTIVE))
    }
    const onResize = () => {
      resize()
      if (!motion) drawStatic()
    }

    resize()
    window.addEventListener('resize', onResize)

    if (!motion) {
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

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
