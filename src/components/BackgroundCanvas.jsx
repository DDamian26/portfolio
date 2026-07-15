import { useEffect, useRef } from 'react'

// Fixed full-viewport canvas behind all content.
// Draws two things: a soft horizon arc of yellow light near the top of the
// hero, and a large cursor-following glow that lerps toward the pointer
// like candlelight being carried across the page.
export default function BackgroundCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const isTouch = window.matchMedia('(pointer: coarse)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let rafId = 0

    const cursor = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let hasPointer = false

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      target.x = cursor.x = width / 2
      target.y = cursor.y = height * 0.35
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

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height)
      drawArc()
    }

    const frame = () => {
      // Lerp toward the pointer for the trailing candlelight feel.
      cursor.x += (target.x - cursor.x) * 0.08
      cursor.y += (target.y - cursor.y) * 0.08

      ctx.clearRect(0, 0, width, height)
      drawArc()
      if (hasPointer) drawCursorGlow()
      rafId = requestAnimationFrame(frame)
    }

    const onPointerMove = (e) => {
      hasPointer = true
      target.x = e.clientX
      target.y = e.clientY
    }

    const onResize = () => {
      resize()
      if (isTouch) drawStatic()
    }

    resize()
    window.addEventListener('resize', onResize)

    if (isTouch) {
      // No cursor on touch devices — draw the arc once, skip the rAF loop.
      drawStatic()
    } else {
      window.addEventListener('pointermove', onPointerMove)
      rafId = requestAnimationFrame(frame)
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onPointerMove)
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
