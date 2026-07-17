// Shared signal for the Before/After "light spill" (part 2, section 4).
// While a comparison slider is being dragged, BeforeAfter writes the active
// card's viewport centre and a target intensity here; the background canvas
// reads it each frame and eases a soft yellow radial glow toward that point.
// Kept as a plain module object (not React state) so the rAF loop can read it
// every frame with zero re-render cost.
export const lightSpill = { x: 0, y: 0, target: 0 }

export function setLightSpill(x, y, target) {
  lightSpill.x = x
  lightSpill.y = y
  lightSpill.target = target
}
