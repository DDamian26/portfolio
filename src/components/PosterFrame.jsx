import { useEffect, useRef, useState } from 'react'
import PlayIcon from './PlayIcon'
import useNearViewport from '../lib/useNearViewport'

// A never-black poster surface for a video card / mobile lightbox trigger.
// Layered, bottom to top:
//   1. branded placeholder (dark gradient + faint label) — always present, so a
//      card is never a pure-black rectangle even if nothing else loads.
//   2. the first image in `sources` that loads (tried in order via onError):
//      explicit poster JPGs, or YouTube thumbnails (maxres -> hq -> local).
//   3. if no image loads and `firstFrameSrc` is given, a muted <video> seeked to
//      ~0.1s so the clip's first frame paints as a still (interim until poster
//      JPGs are supplied; gated to near-viewport so it stays lazy).
//   4. a soft darken + the yellow play button.
// Rendered as a <button> when `onClick` is given (mobile lightbox trigger),
// otherwise a plain div (desktop still frame).
export default function PosterFrame({
  sources = [],
  firstFrameSrc,
  label,
  brand = 'Damian Kaczor',
  onClick,
  playSize = 64,
}) {
  const imgs = sources.filter(Boolean)
  const [imgIdx, setImgIdx] = useState(0)
  const imgOk = imgIdx < imgs.length
  const [nearRef, isNear] = useNearViewport('300px')
  const videoRef = useRef(null)
  // Only fall back to a first-frame still when no poster image resolves, and
  // only once near the viewport so it doesn't fetch metadata up front.
  const useFrame = !imgOk && !!firstFrameSrc && isNear

  const setRefs = (el) => {
    nearRef.current = el
  }

  useEffect(() => {
    if (!useFrame) return
    const v = videoRef.current
    if (!v) return
    const seek = () => {
      try {
        v.currentTime = 0.1
      } catch {
        /* ignore */
      }
    }
    v.addEventListener('loadeddata', seek)
    return () => v.removeEventListener('loadeddata', seek)
  }, [useFrame])

  const content = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[10px] font-semibold uppercase tracking-[0.25em] text-muted/60"
      >
        {brand}
      </span>
      {imgOk && (
        <img
          key={imgs[imgIdx]}
          src={imgs[imgIdx]}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setImgIdx((i) => i + 1)}
        />
      )}
      {useFrame && (
        <video
          ref={videoRef}
          src={firstFrameSrc}
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <span
        style={{ width: playSize, height: playSize }}
        className="relative flex items-center justify-center rounded-full bg-accent text-bg shadow-glow"
      >
        <PlayIcon className="h-[34%] w-[34%]" />
      </span>
    </>
  )

  const cls =
    'relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-card-hover via-card to-bg'

  if (onClick) {
    return (
      <button ref={setRefs} type="button" onClick={onClick} aria-label={label} className={cls}>
        {content}
      </button>
    )
  }
  return (
    <div ref={setRefs} className={cls}>
      {content}
    </div>
  )
}
