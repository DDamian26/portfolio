import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import VideoPlayer from './VideoPlayer'

// Mobile video lightbox.
//
// On touch / small screens, inline video controls collide with the floating
// nav. Instead of playing inline there, a video card opens this fullscreen
// overlay: the player gets the whole screen at the right aspect ratio, page
// scroll is locked, and the nav hides (both via the `lightbox-open` class on
// <html>, see index.css). The player mounts only while open.
//
// It renders by item.type:
//   { type: 'mp4', src, poster, vertical, title } -> our custom <VideoPlayer>
//     (self-hosted, full control of the chrome, controls auto-hide, etc.)
//   { type: 'youtube', youtubeId, title } -> YouTube iframe at 16:9. YouTube's
//     own player chrome exists once playing (the tradeoff for adaptive
//     streaming); our close X sits top-right, clear of YouTube's bottom
//     controls. Do NOT hack the iframe interior.
//
// The close X, Escape, and the back gesture all close via one pushed history
// entry; body scroll is pinned (iOS-safe) and restored on close.
//
// Wrap a subtree in <LightboxProvider> and call the function from useLightbox().

const LightboxContext = createContext(() => {})
export const useLightbox = () => useContext(LightboxContext)

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function Overlay({ item, onClose, closeLabel, playerLabels }) {
  const { type, youtubeId, src, poster, vertical, title } = item
  // Leave headroom at the top so tall (9:16) content never reaches the close
  // button's tap area; the button sits above everything at z-[110].
  const frame = vertical
    ? 'aspect-[9/16] h-[82vh] max-h-[82vh] max-w-[94vw]'
    : 'aspect-video w-[94vw] max-w-[900px] max-h-[82vh]'
  const kind = type || 'mp4'

  // Swipe-down-to-close: a clear, quick, mostly-vertical downward drag on the
  // overlay closes it. Horizontal drags (scrubbing) and taps don't trigger it.
  // Touches inside a cross-origin iframe (YouTube) don't bubble here, so for
  // those the surrounding area, the X and the back gesture are the exits.
  const touch = useRef(null)
  const onTouchStart = (e) => {
    const t = e.touches[0]
    touch.current = { x: t.clientX, y: t.clientY, at: Date.now() }
  }
  const onTouchEnd = (e) => {
    const s = touch.current
    touch.current = null
    if (!s) return
    const t = e.changedTouches[0]
    const dx = t.clientX - s.x
    const dy = t.clientY - s.y
    if (dy > 90 && dy > Math.abs(dx) * 1.8 && Date.now() - s.at < 700) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-3"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        // ~16px inset plus the iOS notch safe-area; dark circular backing so the
        // X is legible over any content; topmost so nothing overlaps its hit area.
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
          right: 'calc(env(safe-area-inset-right, 0px) + 16px)',
        }}
        className="absolute z-[110] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/60 text-heading shadow-lg backdrop-blur-sm transition-colors duration-200 hover:bg-black/80 hover:text-accent"
      >
        <CloseIcon />
      </button>
      <div className={`overflow-hidden rounded-lg ${frame}`}>
        {kind === 'mp4' && (
          <VideoPlayer src={src} poster={poster} vertical={vertical} title={title} autoPlay labels={playerLabels} />
        )}
        {kind === 'youtube' && (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`}
            title={title}
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
          />
        )}
      </div>
    </div>
  )
}

export function LightboxProvider({ children, closeLabel = 'Close video', playerLabels }) {
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
      {item && <Overlay item={item} onClose={requestClose} closeLabel={closeLabel} playerLabels={playerLabels} />}
    </LightboxContext.Provider>
  )
}
