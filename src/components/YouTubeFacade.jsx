import { useState } from 'react'
import PlayIcon from './PlayIcon'

// Featured long-form facade (Part B). The YouTube iframe is NOT mounted on page
// load: the card shows a poster + our yellow play button, and only on click does
// the real iframe mount and autoplay (safe — it follows a user gesture). This
// keeps initial load fast and means YouTube's UI never appears until the visitor
// chooses to watch. Poster falls back to YouTube's own thumbnail, then to the
// gradient placeholder, so a not-yet-set video id degrades gracefully.

function Poster({ youtubeId, poster }) {
  const chain = [poster, `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`].filter(Boolean)
  const [idx, setIdx] = useState(0)
  if (idx >= chain.length) return null
  return (
    <img
      src={chain[idx]}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setIdx((i) => i + 1)}
    />
  )
}

export default function YouTubeFacade({ youtubeId, poster, title, playLabel = 'Play' }) {
  const [active, setActive] = useState(false)

  if (active) {
    return (
      <div className="h-full w-full bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0&playsinline=1`}
          title={title}
          allow="autoplay; fullscreen; encrypted-media"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      aria-label={`${playLabel}: ${title}`}
      className="group/facade relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-card-hover via-card to-bg"
    >
      <Poster youtubeId={youtubeId} poster={poster} />
      {/* Slight darken so the play button always reads over any poster. */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/25" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg shadow-glow transition-transform duration-300 group-hover/facade:scale-105">
        <PlayIcon className="h-[34%] w-[34%]" />
      </span>
    </button>
  )
}
