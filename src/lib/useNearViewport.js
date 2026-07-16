import { useEffect, useRef, useState } from 'react'

// Returns [ref, near]: `near` flips to true once the referenced element
// approaches the viewport, so heavy embeds can mount lazily.
export default function useNearViewport(margin = '300px') {
  const ref = useRef(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (!ref.current || near) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: margin },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [near, margin])

  return [ref, near]
}
