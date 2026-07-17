// Barely-visible warm film grain over the whole page.
// The noise is tinted toward the accent in the SVG filter itself, so at
// 2-3% opacity it adds warmth instead of graying the palette out.
// Static background image, zero runtime cost.
const NOISE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 0.84  0 0 0 0 0.04  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.035]"
      style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG)}")` }}
    />
  )
}
