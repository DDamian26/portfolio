import PlayIcon from './PlayIcon'

// Reusable video slot. Populate later without touching layout:
//   <VideoSlot src="/clips/anchor.mp4" />          local file
//   <VideoSlot youtubeId="dQw4w9WgXcQ" />          YouTube embed
// With neither prop it renders a warm placeholder panel.
// `showPlayOnHover` fades the play button in only while an ancestor
// with the `group` class is hovered (placeholder mode only).
export default function VideoSlot({
  src,
  youtubeId,
  vertical = false,
  title = 'Video',
  showPlayOnHover = false,
  playSize = 64,
}) {
  const frame = `w-full ${vertical ? 'aspect-[9/16]' : 'aspect-video'}`

  if (youtubeId) {
    return (
      <iframe
        className={`${frame} bg-card`}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
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
