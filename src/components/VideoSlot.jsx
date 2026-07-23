import PlayIcon from './PlayIcon'
import useNearViewport from '../lib/useNearViewport'

// Reusable video slot.
//   <VideoSlot src="/clips/anchor.mp4" />          local file
//   <VideoSlot youtubeId="dQw4w9WgXcQ" />          YouTube embed
// With no source prop it renders a warm placeholder panel.
// `showPlayOnHover` only applies to the placeholder (embedded players carry
// their own controls).
export default function VideoSlot({
  src,
  youtubeId,
  vertical = false,
  title = 'Video',
  showPlayOnHover = false,
  playSize = 64,
}) {
  const [nearRef, isNear] = useNearViewport()
  const frame = `w-full ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`

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
