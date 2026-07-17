import { createContext, useCallback, useContext, useEffect, useState } from 'react'

// Mobile video lightbox.
//
// On touch / small screens, Drive's inline player controls overflow the card
// and collide with the floating nav. Instead of playing inline there, a video
// card opens this fullscreen overlay: the Drive iframe gets the whole screen at
// the right aspect ratio, page scroll is locked, and the nav hides (both via
// the `lightbox-open` class on <html>, see index.css). The iframe mounts only
// while open, which also keeps the mobile card light.
//
// Known limitation (do not fight): the player UI *inside* a Google Drive embed
// is Drive's own player. Its controls, and the native tap-to-show/hide of those
// controls, cannot be restyled, auto-hidden, or scripted by us — cross-origin
// iframe. We only own OUR chrome (the close button, the nav) and keep it clear
// of Drive's controls: the close sits top-right, Drive's controls sit along the
// bottom, and the nav is hidden while open, so they never overlap. Full control
// of the playback UI would require migrating these clips to self-hosted MP4s
// (as the Before/After section already uses) played in a <video> element.
//
// iOS note: the iframe carries allow="autoplay; fullscreen". iOS may still route
// a Drive clip into its own fullscreen player; that is acceptable and returns
// cleanly to this overlay on exit. Self-hosted <video> elsewhere uses playsInline
// so iOS does not hijack those.
//
// Wrap a subtree in <LightboxProvider> and call the function from useLightbox()
// with { driveId, vertical, title } to open it.

const LightboxContext = createContext(() => {})
export const useLightbox = () => useContext(LightboxContext)

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Overlay({ item, onClose, closeLabel }) {
  const { driveId, vertical, title } = item
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 p-3">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-shadow duration-300 hover:shadow-glow-lg"
      >
        <CloseIcon />
      </button>
      {/* Long-form: 16:9 centered, capped width. Shorts: 9:16 filling height.
          Drive letterboxes its own content on black, so any small ratio
          mismatch is invisible against the black backdrop. */}
      <div
        className={
          vertical
            ? 'aspect-[9/16] h-[88vh] max-w-[94vw]'
            : 'aspect-video w-[94vw] max-w-[900px] max-h-[88vh]'
        }
      >
        <iframe
          className="h-full w-full rounded-lg"
          src={`https://drive.google.com/file/d/${driveId}/preview`}
          title={title}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  )
}

export function LightboxProvider({ children, closeLabel = 'Close video' }) {
  const [item, setItem] = useState(null)
  const open = useCallback((v) => setItem(v), [])

  useEffect(() => {
    if (!item) return
    const root = document.documentElement
    const body = document.body
    const scrollY = window.scrollY
    root.classList.add('lightbox-open')
    // Robust scroll lock including iOS Safari, where `overflow: hidden` alone
    // does not hold: pin the body at its current offset and restore on close.
    // Orientation changes just reflow the vh/vw-sized overlay, no JS needed.
    const prev = { position: body.style.position, top: body.style.top, width: body.style.width }
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    // Push a history entry so a back-swipe / hardware back closes the lightbox
    // instead of leaving the page.
    window.history.pushState({ lightbox: true }, '')
    const onKey = (e) => {
      if (e.key === 'Escape') window.history.back()
    }
    const onPop = () => setItem(null)
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    return () => {
      root.classList.remove('lightbox-open')
      body.style.position = prev.position
      body.style.top = prev.top
      body.style.width = prev.width
      // Restore instantly; the page must not appear to scroll back (the global
      // scroll-behavior: smooth would otherwise animate this jump).
      const prevBehavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(0, scrollY)
      root.style.scrollBehavior = prevBehavior
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
    }
  }, [item])

  // Close routes through history.back() so X, Escape and back-swipe all take
  // the same path (popstate -> clear), keeping the pushed entry balanced.
  const requestClose = useCallback(() => {
    if (window.history.state?.lightbox) window.history.back()
    else setItem(null)
  }, [])

  return (
    <LightboxContext.Provider value={open}>
      {children}
      {item && <Overlay item={item} onClose={requestClose} closeLabel={closeLabel} />}
    </LightboxContext.Provider>
  )
}
