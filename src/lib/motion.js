// Single source of truth for scroll-reveal motion.
// Every reveal on the page uses these values so the whole site moves as one.
export const EASE = [0.22, 1, 0.36, 1]
export const DURATION = 0.6
export const VIEWPORT_ONCE = { once: true, margin: '-80px' }

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
}

export const stagger = (staggerChildren = 0.15, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})
