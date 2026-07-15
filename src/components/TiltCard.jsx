import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

const MAX_TILT = 4 // degrees

// 3D tilt following the cursor, springing back flat on leave.
export default function TiltCard({ className, children }) {
  const ref = useRef(null)
  const px = useMotionValue(0.5) // pointer position within the card, 0..1
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), {
    stiffness: 220,
    damping: 18,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), {
    stiffness: 220,
    damping: 18,
  })

  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse') return
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
