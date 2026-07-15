import { motion } from 'framer-motion'
import { DURATION, EASE, VIEWPORT_ONCE } from '../lib/motion'

// Shared scroll-into-view fade/rise animation. Runs once per element.
export default function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT_ONCE}
      transition={{ duration: DURATION, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
