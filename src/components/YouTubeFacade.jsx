import { useState } from 'react'
import PosterFrame from './PosterFrame'

// Featured long-form facade (Part B). The YouTube iframe is NOT mounted on page
// load: the card shows a poster + our yellow play button, and only on click does
// the real iframe mount and autoplay (safe — it follows a user gesture). This
// keeps initial load fast and means YouTube's UI never appears until the visitor
// chooses to watch. The poster tries the graceful chain maxresdefault ->
// hqdefault -> local poster, and finally a branded placeholder (never black).

// YouTube thumbnail URLs for an id, best quality first. Exported so the mobile
// poster (which opens the lightbox instead of mounting inline) reuses the chain.
export const youtubeThumbs = (id) => [
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
]

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
    <PosterFrame
      sources={[...youtubeThumbs(youtubeId), poster]}
      label={`${playLabel}: ${title}`}
      onClick={() => setActive(true)}
    />
  )
}
