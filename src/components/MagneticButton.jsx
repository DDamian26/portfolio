import { useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'

const RANGE = 10 // max translation toward the cursor, in px

// Anchor that drifts subtly toward the cursor while hovered
// and springs back to rest on leave.
export default function MagneticButton({ href, className, children }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 320, damping: 22 })
  const springY = useSpring(y, { stiffness: 320, damping: 22 })

  const reduceMotion = useReducedMotion()

  const onPointerMove = (e) => {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const rect = ref.current.getBoundingClientRect()
    x.set(((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * RANGE)
    y.set(((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * RANGE)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={className}
    >
      {children}
    </motion.a>
  )
}
