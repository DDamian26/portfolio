import { useEffect, useState } from 'react'

// True on touch devices / viewports below 768px, where inline video controls
// collide with the floating nav — there, a video card opens the fullscreen
// lightbox instead of playing inline.
export default function useMobileVideo() {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (pointer: coarse)')
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return mobile
}
