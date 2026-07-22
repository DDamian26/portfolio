import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LanguageToggle from './LanguageToggle'

// Standalone EN/PL toggle pinned to the top-right of the splash, so the
// language can be switched before the floating nav exists. It fades out
// at the same scroll threshold where the nav fades in, so the two toggles
// are never visible together.
export default function SplashLanguageToggle() {
  const [navVisible, setNavVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setNavVisible(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {!navVisible && (
        <motion.div
          data-splash-toggle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25, delay: 0 } }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6"
        >
          {/* Subtle at rest, full strength on hover/tap */}
          <div className="opacity-60 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
            <LanguageToggle instanceId="splash" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
