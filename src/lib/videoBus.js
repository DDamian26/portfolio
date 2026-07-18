// Site-wide "one video at a time" registry. Any player that starts calls
// claimPlayback(stop) with its own pause function; the previously-active player
// (a Portfolio short, or a Before/After comparison row) is paused. On pause/end
// a player calls releasePlayback(stop) to clear itself if it is still the owner.
let activeStop = null

export function claimPlayback(stop) {
  if (activeStop && activeStop !== stop) activeStop()
  activeStop = stop
}

export function releasePlayback(stop) {
  if (activeStop === stop) activeStop = null
}
