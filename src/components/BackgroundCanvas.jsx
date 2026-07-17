import { useEffect, useRef } from 'react'
import { lightSpill } from '../lib/lightSpill'

// "Cinematic luxury" background with a per-section atmosphere controller (part 2).
//
// A single fixed canvas paints the layer stack from part 1 (pure-black base,
// large warm spotlights, a light-masked fine grid, animated film grain, and
// projector-beam dust), plus the focused cursor lamp. Part 2 adds the ATMOSPHERE
// CONTROLLER: scroll position blends smoothly between per-section presets so the
// spotlights, grid visibility, particle density, yellow intensity and a few
// section-specific extras morph across the boundaries — no hard switches.
//
// Desktop (motion): a single rAF loop draws the fully blended atmosphere.
// Mobile: per-section light/grid changes only (the mood), redrawn on scroll; no
//   dust, lamp, streaks, scanlines, parallax or interactive spill.
// Reduced motion: frozen to the nearest section preset, redrawn on scroll.

const TAU = Math.PI * 2
const CELL = 64
const GRID_BASE = 0.055
const LAMP_RADIUS = 140
const HALO_BOX = 320
const GRAIN_TILE = 128
const GRAIN_FRAMES = 3

// Sections in document order. Each id maps to a preset key below.
const SECTION_IDS = [
  ['top', 'splash'],
  ['hero', 'hero'],
  ['work', 'portfolio'],
  ['results', 'beforeafter'],
  ['about', 'about'],
  ['faq', 'faq'],
  ['contact', 'contact'],
]

// Per-section presets. Every preset has exactly 3 light slots (a: 0 = off) so
// they interpolate slot-by-slot. `grid` scales GRID_BASE; `particles`,
// `vignette`, `grain` and the extras are 0..1 weights. The light alphas encode
// the yellow-intensity curve (Splash 2% → Hero 5% → Portfolio 10% →
// Before/After 20% climax → About 5% → FAQ 4% → Contact 2%).
const OFF = { xf: 0.5, yf: 0.5, r: 400, a: 0 }
const PRESETS = {
  // 1. Cinema before the film starts: one dim light behind the name.
  splash: {
    lights: [{ xf: 0.5, yf: 0.42, r: 660, a: 0.03 }, OFF, OFF],
    grid: 0.1, particles: 0.3, vignette: 0.6, grain: 1,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 0,
  },
  // 2. Editing timeline: alive, timeline lanes, rare streaks, slight parallax.
  hero: {
    lights: [{ xf: 0.5, yf: 0.14, r: 780, a: 0.05 }, { xf: 0.18, yf: 0.72, r: 520, a: 0.028 }, OFF],
    grid: 0.5, particles: 0.7, vignette: 0.4, grain: 1,
    timeline: 1, streaks: 1, parallax: 1, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 0,
  },
  // 3. Cinema screen: lights pull to the edges + a low under-glow, dust recedes.
  portfolio: {
    lights: [{ xf: 0.05, yf: 0.5, r: 560, a: 0.05 }, { xf: 0.95, yf: 0.5, r: 560, a: 0.05 }, { xf: 0.5, yf: 0.96, r: 760, a: 0.05 }],
    grid: 0.3, particles: 0.1, vignette: 1, grain: 1,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 0,
  },
  // 4. Colour grading suite (climax, 20%): golden central bloom + scanlines + UI lines.
  beforeafter: {
    lights: [{ xf: 0.5, yf: 0.5, r: 880, a: 0.13 }, { xf: 0.5, yf: 0.5, r: 440, a: 0.07 }, { xf: 0.5, yf: 0.5, r: 200, a: 0.05 }],
    grid: 0.65, particles: 0.6, vignette: 0.2, grain: 1,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 1, bloom: 1, uiLines: 1, blueprint: 0,
  },
  // 5. Workshop: matte, reduced lights, more grid, blueprint corner accents.
  about: {
    lights: [{ xf: 0.32, yf: 0.36, r: 560, a: 0.045 }, { xf: 0.72, yf: 0.76, r: 420, a: 0.022 }, OFF],
    grid: 1, particles: 0.5, vignette: 0.5, grain: 1.3,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 1,
  },
  // 6. Quiet transition.
  faq: {
    lights: [{ xf: 0.5, yf: 0.22, r: 600, a: 0.04 }, OFF, OFF],
    grid: 0.45, particles: 0.35, vignette: 0.6, grain: 1,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 0,
  },
  // 7. Fade to black: one soft spotlight on the CTA, everything else recedes.
  contact: {
    lights: [{ xf: 0.5, yf: 0.34, r: 640, a: 0.032 }, OFF, OFF],
    grid: 0.06, particles: 0.08, vignette: 0.85, grain: 1,
    timeline: 0, streaks: 0, parallax: 0, scanlines: 0, bloom: 0, uiLines: 0, blueprint: 0,
  },
}

const lerp = (a, b, t) => a + (b - a) * t
const smooth = (x) => x * x * (3 - 2 * x)
const lerpLight = (a, b, t) => ({ xf: lerp(a.xf, b.xf, t), yf: lerp(a.yf, b.yf, t), r: lerp(a.r, b.r, t), a: lerp(a.a, b.a, t) })

function lerpPreset(a, b, t) {
  const out = { lights: [lerpLight(a.lights[0], b.lights[0], t), lerpLight(a.lights[1], b.lights[1], t), lerpLight(a.lights[2], b.lights[2], t)] }
  for (const k of ['grid', 'particles', 'vignette', 'grain', 'timeline', 'streaks', 'parallax', 'scanlines', 'bloom', 'uiLines', 'blueprint']) {
    out[k] = lerp(a[k], b[k], t)
  }
  return out
}

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    const motion = !reducedMotion && !isTouch

    let width = 0, height = 0, dpr = 1, rafId = 0, running = false
    let frameCount = 0, emaDt = 16, lastTime = 0

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false
    let overInteractive = false
    let focus = 1
    let haloScale = 1

    let particles = []
    let sections = [] // cached [{key, top, height}] — measured off the scroll path
    let spillCur = 0 // eased Before/After light-spill intensity
    let streak = null // occasional hero streak

    // Offscreen layers
    const gridCanvas = document.createElement('canvas')
    const gridCtx = gridCanvas.getContext('2d')
    const haloCanvas = document.createElement('canvas')
    const haloCtx = haloCanvas.getContext('2d')
    const vigCanvas = document.createElement('canvas')
    const vigCtx = vigCanvas.getContext('2d')
    let grainPatterns = []
    let scanPattern = null

    // ---- Section measurement (never called from the scroll handler) ----
    const measureSections = () => {
      const sy = window.scrollY || 0
      sections = SECTION_IDS.map(([id, key]) => {
        const el = document.getElementById(id)
        if (!el) return null
        const r = el.getBoundingClientRect()
        return { key, top: r.top + sy, height: r.height || 1 }
      }).filter(Boolean)
    }

    // ---- Atmosphere at a given document focus point ----
    const atmosphereAt = (focusY, blend) => {
      if (!sections.length) return PRESETS.hero
      let i = sections.findIndex((s) => focusY < s.top + s.height)
      if (i === -1) i = sections.length - 1
      if (i < 0) i = 0
      const s = sections[i]
      const p = Math.min(1, Math.max(0, (focusY - s.top) / s.height))
      const cur = PRESETS[s.key]
      if (!blend) return cur
      // Blend across the last 20% of a section into the first 20% of the next,
      // meeting at 50% on the boundary; smoothstep for a gentle transition.
      if (p < 0.2 && i > 0) {
        const w = 0.5 + 0.5 * smooth(p / 0.2)
        return lerpPreset(PRESETS[sections[i - 1].key], cur, w)
      }
      if (p > 0.8 && i < sections.length - 1) {
        const w = 0.5 * smooth((p - 0.8) / 0.2)
        return lerpPreset(cur, PRESETS[sections[i + 1].key], w)
      }
      return cur
    }

    // ---- Layer builders ----
    const resolveLights = (atmo, offY) =>
      atmo.lights.map((l) => ({ x: l.xf * width, y: l.yf * height + offY, r: l.r, a: l.a }))

    // Fill only the light's radius box (clamped to the viewport); the gradient
    // is transparent beyond r, so full-viewport fills are wasted overdraw.
    const fillBounded = (cx, cy, r) => {
      const x0 = Math.max(0, cx - r), y0 = Math.max(0, cy - r)
      const x1 = Math.min(width, cx + r), y1 = Math.min(height, cy + r)
      if (x1 > x0 && y1 > y0) ctx.fillRect(x0, y0, x1 - x0, y1 - y0)
    }
    const drawSpots = (lights) => {
      for (const l of lights) {
        if (l.a < 0.002 || l.r < 1) continue
        const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
        g.addColorStop(0, `rgba(255, 214, 10, ${l.a.toFixed(4)})`)
        g.addColorStop(0.5, `rgba(255, 210, 40, ${(l.a * 0.35).toFixed(4)})`)
        g.addColorStop(1, 'rgba(255, 214, 10, 0)')
        ctx.fillStyle = g
        fillBounded(l.x, l.y, l.r)
      }
    }

    const strokeGrid = (c, ox, oy, w, h, alpha) => {
      c.strokeStyle = `rgba(255, 246, 224, ${alpha})`
      c.lineWidth = 1
      c.beginPath()
      let sx = -(((ox % CELL) + CELL) % CELL)
      for (let x = sx; x <= w; x += CELL) { const px = Math.round(x) + 0.5; c.moveTo(px, 0); c.lineTo(px, h) }
      let sy = -(((oy % CELL) + CELL) % CELL)
      for (let y = sy; y <= h; y += CELL) { const py = Math.round(y) + 0.5; c.moveTo(0, py); c.lineTo(w, py) }
      c.stroke()
    }

    // Rebuild the masked grid (grid ∩ spotlights) only when it actually changed
    // (i.e. on scroll/resize) — during a stationary drag the atmosphere is fixed,
    // so the cached gridCanvas is reused and this whole pass is skipped.
    let gridSig = ''
    const buildGrid = (lights, weight, offY) => {
      const sig =
        `${weight.toFixed(3)}|${offY.toFixed(1)}|` +
        lights.map((l) => `${l.x | 0},${l.y | 0},${l.r | 0},${l.a.toFixed(3)}`).join(';')
      if (sig === gridSig) return
      gridSig = sig
      gridCtx.clearRect(0, 0, width, height)
      const a = GRID_BASE * weight
      if (a < 0.001) return
      strokeGrid(gridCtx, 0, offY, width, height, a)
      gridCtx.globalCompositeOperation = 'destination-in'
      for (const l of lights) {
        if (l.a < 0.002 || l.r < 1) continue
        const g = gridCtx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r)
        g.addColorStop(0, 'rgba(255,255,255,1)')
        g.addColorStop(1, 'rgba(255,255,255,0)')
        gridCtx.fillStyle = g
        gridCtx.fillRect(0, 0, width, height)
      }
      gridCtx.globalCompositeOperation = 'source-over'
    }

    const drawHaloGrid = (offY) => {
      const half = HALO_BOX / 2
      haloCtx.clearRect(0, 0, HALO_BOX, HALO_BOX)
      strokeGrid(haloCtx, cursor.x - half, cursor.y - half - offY, HALO_BOX, HALO_BOX, 0.1 * focus)
      haloCtx.globalCompositeOperation = 'destination-in'
      const g = haloCtx.createRadialGradient(half, half, 0, half, half, half)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      haloCtx.fillStyle = g
      haloCtx.fillRect(0, 0, HALO_BOX, HALO_BOX)
      haloCtx.globalCompositeOperation = 'source-over'
      ctx.drawImage(haloCanvas, cursor.x - half, cursor.y - half)
    }

    const buildGrain = () => {
      grainPatterns = []
      for (let t = 0; t < 4; t++) {
        const c = document.createElement('canvas')
        c.width = GRAIN_TILE; c.height = GRAIN_TILE
        const cc = c.getContext('2d')
        const img = cc.createImageData(GRAIN_TILE, GRAIN_TILE)
        for (let i = 0; i < img.data.length; i += 4) {
          const v = Math.random()
          img.data[i] = 255; img.data[i + 1] = 246; img.data[i + 2] = 224; img.data[i + 3] = v * v * 255
        }
        cc.putImageData(img, 0, 0)
        grainPatterns.push(ctx.createPattern(c, 'repeat'))
      }
    }
    const buildScan = () => {
      const c = document.createElement('canvas')
      c.width = 4; c.height = 4
      const cc = c.getContext('2d')
      cc.fillStyle = 'rgba(255,246,224,1)'
      cc.fillRect(0, 0, 4, 1)
      scanPattern = ctx.createPattern(c, 'repeat')
    }
    let grainIdx = 0
    let grainOff = { x: 0, y: 0 }
    const drawGrain = (weight, animate) => {
      if (animate && frameCount % GRAIN_FRAMES === 0) {
        grainIdx = (grainIdx + 1) % grainPatterns.length
        grainOff = { x: (Math.random() * CELL) | 0, y: (Math.random() * CELL) | 0 }
      }
      ctx.save()
      ctx.globalAlpha = 0.03 * weight
      ctx.translate(-grainOff.x, -grainOff.y)
      ctx.fillStyle = grainPatterns[grainIdx]
      ctx.fillRect(0, 0, width + CELL, height + CELL)
      ctx.restore()
    }

    // ---- Section-specific extras (all gated by their blended weight) ----
    const drawTimeline = (w) => {
      if (w < 0.01) return
      ctx.strokeStyle = `rgba(255,246,224,${(0.02 * w).toFixed(4)})`
      ctx.lineWidth = 1
      ctx.beginPath()
      for (const yf of [0.34, 0.5, 0.66]) { const y = Math.round(height * yf) + 0.5; ctx.moveTo(0, y); ctx.lineTo(width, y) }
      ctx.stroke()
    }
    const drawScanlines = (w) => {
      if (w < 0.01) return
      ctx.save()
      ctx.globalAlpha = 0.02 * w
      ctx.fillStyle = scanPattern
      ctx.fillRect(0, 0, width, height)
      ctx.restore()
    }
    const drawUiLines = (time, w) => {
      if (w < 0.01) return
      const drift = Math.sin(time * 0.00015) * 12
      ctx.strokeStyle = `rgba(255,246,224,${(0.03 * w).toFixed(4)})`
      ctx.lineWidth = 1
      ctx.beginPath()
      const vx = Math.round(width * 0.27 + drift) + 0.5
      ctx.moveTo(vx, 0); ctx.lineTo(vx, height)
      const hy = Math.round(height * 0.74 - drift) + 0.5
      ctx.moveTo(0, hy); ctx.lineTo(width, hy)
      ctx.stroke()
    }
    const drawBlueprint = (w) => {
      if (w < 0.01) return
      const x0 = width * 0.16, y0 = height * 0.22, x1 = width * 0.84, y1 = height * 0.78
      const L = 18
      ctx.strokeStyle = `rgba(255,246,224,${(0.03 * w).toFixed(4)})`
      ctx.lineWidth = 1
      ctx.beginPath()
      const corner = (cx, cy, dx, dy) => { ctx.moveTo(cx, cy); ctx.lineTo(cx + dx * L, cy); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + dy * L) }
      corner(x0, y0, 1, 1); corner(x1, y0, -1, 1); corner(x0, y1, 1, -1); corner(x1, y1, -1, -1)
      ctx.stroke()
    }
    const drawSpill = () => {
      spillCur += (lightSpill.target - spillCur) * 0.08
      if (spillCur < 0.01) return
      const r = 520
      const g = ctx.createRadialGradient(lightSpill.x, lightSpill.y, 0, lightSpill.x, lightSpill.y, r)
      g.addColorStop(0, `rgba(255, 220, 70, ${(0.06 * spillCur).toFixed(4)})`)
      g.addColorStop(1, 'rgba(255, 220, 70, 0)')
      ctx.fillStyle = g
      ctx.fillRect(lightSpill.x - r, lightSpill.y - r, r * 2, r * 2)
    }
    const drawStreak = (time, w) => {
      if (w < 0.4) { streak = null; return }
      if (!streak && Math.random() < 0.004) {
        streak = { y: height * (0.2 + Math.random() * 0.6), born: time, life: 5000 + Math.random() * 3000 }
      }
      if (!streak) return
      const p = (time - streak.born) / streak.life
      if (p >= 1) { streak = null; return }
      const env = Math.sin(p * Math.PI) * 0.035 * w
      const cx = -200 + p * (width + 400)
      const g = ctx.createLinearGradient(cx - 220, 0, cx + 220, 0)
      g.addColorStop(0, 'rgba(255,214,10,0)')
      g.addColorStop(0.5, `rgba(255,224,92,${env.toFixed(4)})`)
      g.addColorStop(1, 'rgba(255,214,10,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, streak.y - 1, width, 2)
    }

    // Vignette is a full-viewport radial that only changes with its weight, so
    // cache it to an offscreen and rebuild only when the weight moves (skips a
    // full-canvas fill every frame during a stationary drag).
    let vigSig = ''
    const drawVignette = (w) => {
      if (w < 0.01) return
      const sig = w.toFixed(3)
      if (sig !== vigSig) {
        vigSig = sig
        vigCtx.clearRect(0, 0, width, height)
        const cx = width / 2, cy = height / 2
        const g = vigCtx.createRadialGradient(cx, cy, Math.min(width, height) * 0.3, cx, cy, Math.max(width, height) * 0.72)
        g.addColorStop(0, 'rgba(0,0,0,0)')
        g.addColorStop(1, `rgba(0,0,0,${(0.32 * w).toFixed(3)})`)
        vigCtx.fillStyle = g
        vigCtx.fillRect(0, 0, width, height)
      }
      ctx.drawImage(vigCanvas, 0, 0)
    }

    const drawLamp = () => {
      const r = LAMP_RADIUS * haloScale
      const halo = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, r)
      halo.addColorStop(0, `rgba(255, 224, 92, ${(0.09 * focus).toFixed(4)})`)
      halo.addColorStop(0.5, `rgba(255, 214, 10, ${(0.035 * focus).toFixed(4)})`)
      halo.addColorStop(1, 'rgba(255, 214, 10, 0)')
      ctx.fillStyle = halo
      ctx.fillRect(cursor.x - r, cursor.y - r, r * 2, r * 2)
      const cr = 14
      const core = ctx.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, cr)
      core.addColorStop(0, `rgba(255, 236, 150, ${(0.3 * focus).toFixed(4)})`)
      core.addColorStop(1, 'rgba(255, 236, 150, 0)')
      ctx.fillStyle = core
      ctx.fillRect(cursor.x - cr, cursor.y - cr, cr * 2, cr * 2)
    }

    // ---- Dust ----
    const spawnParticles = () => {
      if (!motion) { particles = []; return }
      const count = Math.round(Math.min(40, Math.max(16, (width * height) / 52000)))
      particles = Array.from({ length: count }, () => {
        const small = Math.random() ** 2.2
        const tier = Math.random() < 0.55 ? 0 : Math.random() < 0.8 ? 1 : 2
        return {
          x: Math.random() * width, y: Math.random() * height,
          size: 1 + small * 3, tier,
          baseAlpha: 0.28 + Math.random() * 0.4,
          vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.05,
          wobAmp: 0.15 + Math.random() * 0.35, wobSpeed: 0.0002 + Math.random() * 0.0004,
          phase: Math.random() * TAU,
        }
      })
    }
    const lightAt = (x, y, lights) => {
      let v = 0
      for (const l of lights) {
        if (l.a < 0.002) continue
        const d = Math.hypot(x - l.x, y - l.y)
        if (d < l.r) v += (1 - d / l.r)
      }
      if (hasPointer) {
        const d = Math.hypot(x - cursor.x, y - cursor.y)
        const rr = LAMP_RADIUS * haloScale * 1.6
        if (d < rr) v += (1 - d / rr) * 1.3 * focus
      }
      return v > 1 ? 1 : v
    }
    const drawDust = (time, lights, density) => {
      if (density < 0.02) return
      for (const p of particles) {
        p.x += p.vx + Math.sin(time * p.wobSpeed + p.phase) * p.wobAmp * 0.02
        p.y += p.vy + Math.cos(time * p.wobSpeed * 0.9 + p.phase) * p.wobAmp * 0.02
        if (p.x < -6) p.x = width + 6; else if (p.x > width + 6) p.x = -6
        if (p.y < -6) p.y = height + 6; else if (p.y > height + 6) p.y = -6
        const lit = lightAt(p.x, p.y, lights)
        const alpha = p.baseAlpha * (0.04 + 0.96 * lit) * density
        if (alpha < 0.01) continue
        ctx.fillStyle = `rgba(255, 232, 150, ${alpha.toFixed(3)})`
        if (p.tier === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.fill() }
        else {
          const rr = p.size * (p.tier === 1 ? 2.4 : 3.6)
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr)
          g.addColorStop(0, `rgba(255,232,150,${(alpha * (p.tier === 1 ? 0.9 : 0.6)).toFixed(3)})`)
          g.addColorStop(1, 'rgba(255,232,150,0)')
          ctx.fillStyle = g
          ctx.fillRect(p.x - rr, p.y - rr, rr * 2, rr * 2)
        }
      }
    }

    const parallaxOffset = (atmo) => {
      if (atmo.parallax < 0.01) return 0
      // Background lags content by a few px through the parallax section.
      const s = sections.find((x) => x.key === 'hero')
      if (!s) return 0
      const rel = (window.scrollY - s.top) / s.height
      return Math.max(-6, Math.min(6, rel * 14)) * atmo.parallax
    }

    // ---- Composers ----
    const drawScene = (time, atmo) => {
      const offY = parallaxOffset(atmo)
      const lights = resolveLights(atmo, offY)
      ctx.clearRect(0, 0, width, height)
      drawSpots(lights)
      drawSpill()
      buildGrid(lights, atmo.grid, offY)
      ctx.drawImage(gridCanvas, 0, 0)
      if (hasPointer) drawHaloGrid(offY)
      drawTimeline(atmo.timeline)
      drawScanlines(atmo.scanlines)
      drawUiLines(time, atmo.uiLines)
      drawBlueprint(atmo.blueprint)
      drawStreak(time, atmo.streaks)
      drawGrain(atmo.grain, true)
      drawDust(time, lights, atmo.particles)
      drawVignette(atmo.vignette)
      if (hasPointer) drawLamp()
    }
    const drawStaticScene = (atmo) => {
      const lights = resolveLights(atmo, 0)
      ctx.clearRect(0, 0, width, height)
      drawSpots(lights)
      buildGrid(lights, atmo.grid, 0)
      ctx.drawImage(gridCanvas, 0, 0)
      drawGrain(atmo.grain, false)
      drawVignette(atmo.vignette)
    }

    const frame = (time) => {
      frameCount += 1
      if (lastTime) emaDt += (time - lastTime - emaDt) * 0.05
      lastTime = time
      if (emaDt > 22 && particles.length > 14) particles.length -= 3

      cursor.x += (target.x - cursor.x) * 0.1
      cursor.y += (target.y - cursor.y) * 0.1
      focus += ((overInteractive ? 1.2 : 1) - focus) * 0.12
      haloScale += ((overInteractive ? 0.85 : 1) - haloScale) * 0.12

      const atmo = atmosphereAt(window.scrollY + height * 0.5, true)
      drawScene(time, atmo)
      rafId = requestAnimationFrame(frame)
    }

    // Non-motion: recompute + redraw on scroll (rAF-coalesced), no layout reads.
    let scrollScheduled = false
    const renderStatic = () => {
      scrollScheduled = false
      const atmo = atmosphereAt(window.scrollY + height * 0.5, !reducedMotion)
      drawStaticScene(atmo)
    }
    const onScrollStatic = () => {
      if (scrollScheduled) return
      scrollScheduled = true
      requestAnimationFrame(renderStatic)
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
      gridCanvas.width = width; gridCanvas.height = height
      vigCanvas.width = width; vigCanvas.height = height
      haloCanvas.width = HALO_BOX; haloCanvas.height = HALO_BOX
      gridSig = ''; vigSig = '' // invalidate cached offscreens at the new size
      buildGrain(); buildScan(); measureSections(); spawnParticles()
    }

    const start = () => { if (running || !motion) return; running = true; rafId = requestAnimationFrame(frame) }
    const stop = () => { running = false; cancelAnimationFrame(rafId); lastTime = 0 }
    const onVisibility = () => (document.hidden ? stop() : start())

    const INTERACTIVE = 'a, button, [role="slider"], article, input, label, summary'
    let lastHitTest = 0
    const onPointerMove = (e) => {
      hasPointer = true
      target.x = e.clientX; target.y = e.clientY
      // Hit-testing the DOM forces layout; throttle it so a fast drag can't
      // spam it every move.
      const now = e.timeStamp || performance.now()
      if (now - lastHitTest > 80) {
        lastHitTest = now
        const el = document.elementFromPoint(e.clientX, e.clientY)
        overInteractive = !!(el && el.closest(INTERACTIVE))
      }
    }
    const onResize = () => {
      resize()
      if (!motion) renderStatic()
    }

    resize()
    // Re-measure when the document height changes (lazy content), off the scroll path.
    const ro = new ResizeObserver(() => measureSections())
    ro.observe(document.body)
    window.addEventListener('resize', onResize)

    if (!motion) {
      window.addEventListener('scroll', onScrollStatic, { passive: true })
      renderStatic()
    } else {
      window.addEventListener('pointermove', onPointerMove)
      document.addEventListener('visibilitychange', onVisibility)
      start()
    }

    return () => {
      stop()
      ro.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScrollStatic)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0" />
}
