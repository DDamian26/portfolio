import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LanguageToggle from './LanguageToggle'
import { SHOW_TESTIMONIALS } from '../config'
import { useLanguage } from '../i18n/LanguageContext'

const LINKS = [
  { key: 'work', href: '#work' },
  { key: 'results', href: '#results' },
  ...(SHOW_TESTIMONIALS ? [{ key: 'testimonials', href: '#testimonials' }] : []),
  { key: 'about', href: '#about' },
]

// Sections observed to track which nav link is active. Non-link sections
// (top, hero, contact) are included so the highlight clears outside them.
const OBSERVED = ['top', 'hero', 'work', 'results', 'testimonials', 'about', 'contact']

export default function Nav() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.7)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      // A horizontal band around 40% viewport height decides the active section.
      { rootMargin: '-40% 0px -55% 0px' },
    )
    OBSERVED.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4"
        >
          <nav className="pointer-events-auto flex w-full max-w-[1100px] items-center justify-between gap-3 rounded-full border border-border-warm bg-card/70 py-2 pl-5 pr-2 shadow-glow-sm backdrop-blur-md md:backdrop-blur-xl">
            <a href="#top" className="whitespace-nowrap text-sm font-bold tracking-tight text-heading">
              {t('nav.name')}
            </a>

            {/* Anchor links collapse away on mobile */}
            <ul className="hidden items-center gap-6 md:flex">
              {LINKS.map(({ key, href }) => {
                const active = activeId === href.slice(1)
                return (
                  <li key={key}>
                    <a
                      href={href}
                      className={`group relative whitespace-nowrap pb-1 text-sm font-medium transition-colors duration-300 ${
                        active ? 'text-accent' : 'text-body hover:text-accent'
                      }`}
                    >
                      {t(`nav.${key}`)}
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </a>
                  </li>
                )
              })}
            </ul>

            <div className="flex items-center gap-2">
              <LanguageToggle />
              <a
                href="#contact"
                className="whitespace-nowrap rounded-full bg-accent px-3 py-2 text-xs font-bold text-bg shadow-glow-sm transition-shadow duration-300 hover:shadow-glow-lg sm:px-4 sm:text-sm"
              >
                {t('nav.cta')}
              </a>
            </div>
          </nav>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
