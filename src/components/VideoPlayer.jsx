import { useCallback, useEffect, useRef, useState } from 'react'
import PlayIcon from './PlayIcon'
import useNearViewport from '../lib/useNearViewport'
import { claimPlayback, releasePlayback } from '../lib/videoBus'

// Self-hosted MP4 player with our own minimal chrome. Used inline on desktop and
// inside the mobile lightbox. Native <video> (playsinline, preload=metadata, no
// native controls); one slim translucent control bar (play/pause, scrub with a
// buffered indicator, time, mute, fullscreen); a center play overlay when
// paused. Controls auto-hide after 2.5s of no interaction during playback and
// return on a light tap (or mouse move on desktop). Volume defaults to 100%,
// mute is remembered per session. Only one video plays site-wide (videoBus).
// If the file is missing the player degrades to a graceful placeholder.

const HIDE_MS = 2500
const MUTE_KEY = 'portfolio.muted'

const fmt = (s) => {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

function PauseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  )
}
function MutedIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <line x1="22" y1="9" x2="16" y2="15" />
      <line x1="16" y1="9" x2="22" y2="15" />
    </svg>
  )
}
function SoundIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M19 6a8 8 0 0 1 0 12" />
    </svg>
  )
}
function FullscreenIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}

export default function VideoPlayer({
  src,
  poster,
  vertical = false,
  title = 'Video',
  autoPlay = false,
  labels = {},
}) {
  const [nearRef, isNear] = useNearViewport('200px')
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const hideTimer = useRef(0)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [muted, setMuted] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [missing, setMissing] = useState(false)

  const L = {
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    fullscreen: 'Fullscreen',
    seek: 'Seek',
    ...labels,
  }

  const setRefs = (el) => {
    containerRef.current = el
    nearRef.current = el
  }

  // ----- auto-hide -----
  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current)
    const v = videoRef.current
    if (v && !v.paused) hideTimer.current = setTimeout(() => setControlsVisible(false), HIDE_MS)
  }, [])
  const reveal = useCallback(() => {
    setControlsVisible(true)
    scheduleHide()
  }, [scheduleHide])

  // ----- playback -----
  const stop = useCallback(() => {
    videoRef.current?.pause()
  }, [])
  const play = useCallback(() => {
    const v = videoRef.current
    if (!v || missing) return
    claimPlayback(stop) // pause every other player site-wide
    v.play().catch(() => {})
  }, [missing, stop])
  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || missing) return
    if (v.paused) play()
    else v.pause()
  }, [missing, play])

  const toggleMute = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    try {
      sessionStorage.setItem(MUTE_KEY, v.muted ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current
    const v = videoRef.current
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
    } else if (c?.requestFullscreen) {
      c.requestFullscreen().catch(() => {})
    } else if (v?.webkitEnterFullscreen) {
      // iOS Safari only supports fullscreen on the <video> itself (native UI).
      v.webkitEnterFullscreen()
    }
  }, [])

  const seekBy = useCallback((delta) => {
    const v = videoRef.current
    if (!v || !Number.isFinite(v.duration)) return
    v.currentTime = Math.min(v.duration, Math.max(0, v.currentTime + delta))
    reveal()
  }, [reveal])

  // ----- wire the <video> once it mounts -----
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = 1 // work samples: full volume by default
    try {
      v.muted = sessionStorage.getItem(MUTE_KEY) === '1'
    } catch {
      /* ignore */
    }
    setMuted(v.muted)

    const onPlay = () => {
      setPlaying(true)
      claimPlayback(stop)
      reveal()
    }
    const onPause = () => {
      setPlaying(false)
      clearTimeout(hideTimer.current)
      setControlsVisible(true)
      releasePlayback(stop)
    }
    const onTime = () => setCurrent(v.currentTime)
    const onMeta = () => setDuration(v.duration || 0)
    const onProgress = () => {
      if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
    }
    const onEnded = () => {
      setPlaying(false)
      setControlsVisible(true)
      releasePlayback(stop)
    }
    const onError = () => setMissing(true)
    const onVol = () => setMuted(v.muted)

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('progress', onProgress)
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', onError)
    v.addEventListener('volumechange', onVol)
    if (autoPlay) play()
    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('progress', onProgress)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', onError)
      v.removeEventListener('volumechange', onVol)
      clearTimeout(hideTimer.current)
      releasePlayback(stop)
    }
  }, [isNear, autoPlay, play, reveal, stop])

  // ----- tap / click on the video surface -----
  const onSurfaceClick = () => {
    if (missing) return
    if (!controlsVisible) reveal()
    else togglePlay()
  }

  const onKeyDown = (e) => {
    if (missing) return
    if (e.key === ' ' || e.key === 'k') {
      e.preventDefault()
      togglePlay()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      seekBy(-5)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      seekBy(5)
    } else if (e.key === 'm') {
      toggleMute()
    } else if (e.key === 'f') {
      toggleFullscreen()
    }
  }

  const pct = duration ? (current / duration) * 100 : 0
  const bufPct = duration ? (buffered / duration) * 100 : 0
  const barBtn = 'flex h-11 w-11 shrink-0 items-center justify-center text-heading transition-colors duration-200 hover:text-accent'

  // Graceful placeholder: not yet mounted, or the file failed to load.
  if (!isNear || missing) {
    return (
      <div
        ref={setRefs}
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-card-hover via-card to-bg"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-accent/[0.03]" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg shadow-glow">
          <PlayIcon className="h-[36%] w-[36%]" />
        </span>
      </div>
    )
  }

  return (
    <div
      ref={setRefs}
      className="relative h-full w-full select-none overflow-hidden bg-black"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={reveal}
      onClick={onSurfaceClick}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        poster={poster || undefined}
        title={title}
        playsInline
        preload="metadata"
      />

      {/* Center play overlay when paused */}
      {!playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-bg shadow-glow">
            <PlayIcon className="h-[34%] w-[34%]" />
          </span>
        </div>
      )}

      {/* Control bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-1.5 pb-1 pt-8 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button type="button" onClick={togglePlay} aria-label={playing ? L.pause : L.play} className={barBtn}>
          {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-4 w-4" />}
        </button>

        {/* Scrub: track + buffered + yellow progress + native range on top */}
        <div className="relative flex h-11 flex-1 items-center">
          <div className="pointer-events-none absolute inset-x-0 h-1 rounded-full bg-white/20" />
          <div className="pointer-events-none absolute left-0 h-1 rounded-full bg-white/30" style={{ width: `${bufPct}%` }} />
          <div className="pointer-events-none absolute left-0 h-1 rounded-full bg-accent" style={{ width: `${pct}%` }} />
          <input
            type="range"
            className="video-scrub absolute inset-0 h-full w-full cursor-pointer"
            min={0}
            max={duration || 0}
            step="0.05"
            value={current}
            aria-label={L.seek}
            onChange={(e) => {
              const v = videoRef.current
              if (v) v.currentTime = Number(e.target.value)
              reveal()
            }}
          />
        </div>

        <span className="shrink-0 px-1 font-mono text-[11px] tabular-nums text-heading/90">
          {fmt(current)} / {fmt(duration)}
        </span>

        <button type="button" onClick={toggleMute} aria-label={muted ? L.unmute : L.mute} className={barBtn}>
          {muted ? <MutedIcon className="h-5 w-5" /> : <SoundIcon className="h-5 w-5" />}
        </button>
        <button type="button" onClick={toggleFullscreen} aria-label={L.fullscreen} className={barBtn}>
          <FullscreenIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
