import PlayIcon from './PlayIcon'
import useNearViewport from '../lib/useNearViewport'
import useMobileVideo from '../lib/useMobileVideo'
import { useLightbox } from './VideoLightbox'

// Reusable video slot. Populate later without touching layout:
//   <VideoSlot src="/clips/anchor.mp4" />          local file
//   <VideoSlot youtubeId="dQw4w9WgXcQ" />          YouTube embed
//   <VideoSlot driveId="1nZKPk...AdG8" />          Google Drive embed
// With no source prop it renders a warm placeholder panel.
//
// Retained for reuse: the Portfolio section moved off Drive (shorts are now
// self-hosted MP4s in <VideoPlayer>, the featured piece is a YouTube facade), so
// nothing renders a Drive embed at the moment. The Drive branch is kept here on
// purpose — the remaining migration step is moving the Before/After comparison
// clips (still local MP4s wired directly, not via this slot) fully into config.
// Embedded players carry their own controls, so no overlay is rendered over
// them; `showPlayOnHover` only applies to the placeholder.
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
