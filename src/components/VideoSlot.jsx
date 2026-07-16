import { useEffect, useRef, useState } from 'react'
import PlayIcon from './PlayIcon'

// Mounts children only once the element approaches the viewport, so heavy
// embeds don't drag down initial page load.
function useNearViewport(margin = '300px') {
  const ref = useRef(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    if (!ref.current || near) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: margin },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [near, margin])
  return [ref, near]
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
}) {
  const [nearRef, isNear] = useNearViewport()
  const frame = `w-full ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`

  if (driveId) {
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
