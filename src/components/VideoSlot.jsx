import { useEffect, useState } from 'react'
import PlayIcon from './PlayIcon'
import useNearViewport from '../lib/useNearViewport'
import { useLightbox } from './VideoLightbox'

// True on touch devices / viewports below 768px, where Drive's inline player
// controls overflow the card and collide with the nav. There we swap inline
// playback for a poster that opens the fullscreen lightbox instead.
function useMobileVideo() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}

// Reusable video slot. Populate later without touching layout:
//   <VideoSlot src="/clips/anchor.mp4" />          local file
//   <VideoSlot youtubeId="dQw4w9WgXcQ" />          YouTube embed
//   <VideoSlot driveId="1nZKPk...AdG8" />          Google Drive embed
// With no source prop it renders a warm placeholder panel.
// Embedded players carry their own controls, so no overlay is rendered
// over them; `showPlayOnHover` only applies to the placeholder (it fades
// the play button in while an ancestor with the `group` class is hovered).
export default function VideoSlot({
  src,
  youtubeId,
  driveId,
  vertical = false,
  title = 'Video',
  showPlayOnHover = false,
  playSize = 64,
  playLabel = 'Play',
}) {
  const [nearRef, isNear] = useNearViewport()
  const openLightbox = useLightbox()
  const mobile = useMobileVideo()
  const frame = `w-full ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`

  if (driveId) {
    // Mobile/touch: poster that opens the fullscreen lightbox; no inline iframe
    // mounts here, which also keeps the mobile card light.
    if (mobile) {
      return (
        <button
          type="button"
          onClick={() => openLightbox({ driveId, vertical, title })}
          aria-label={`${playLabel}: ${title}`}
          className={`relative flex items-center justify-center overflow-hidden ${frame} bg-gradient-to-br from-card-hover via-card to-bg`}
        >
          <div aria-hidden="true" className="absolute inset-0 bg-accent/[0.03]" />
          <span
            style={{ width: playSize, height: playSize }}
            className="relative flex items-center justify-center rounded-full bg-accent text-bg shadow-glow"
          >
            <PlayIcon className="h-[36%] w-[36%]" />
          </span>
        </button>
      )
    }
    // Desktop (mouse): current inline Drive playback, unchanged.
    return (
      <div ref={nearRef} className={`${frame} bg-card`}>
        {isNear && (
          <iframe
            className="h-full w-full"
            src={`https://drive.google.com/file/d/${driveId}/preview`}
            title={title}
            allow="autoplay; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
    )
  }

  if (youtubeId) {
    return (
      <div ref={nearRef} className={`${frame} bg-card`}>
        {isNear && (
          <iframe
            className="h-full w-full"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    )
  }

  if (src) {
    return <video className={`${frame} bg-card object-cover`} src={src} controls playsInline preload="metadata" />
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${frame} bg-gradient-to-br from-card-hover via-card to-bg`}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-accent/[0.03]" />
      <span
        style={{ width: playSize, height: playSize }}
        className={`relative flex items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-opacity duration-300 ${
          showPlayOnHover ? 'opacity-0 group-hover:opacity-100' : ''
        }`}
      >
        <PlayIcon className="h-[36%] w-[36%]" />
      </span>
    </div>
  )
}
