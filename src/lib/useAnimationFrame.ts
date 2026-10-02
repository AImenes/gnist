import { useEffect, useRef } from 'react'

/**
 * Runs `cb(dtSeconds, tSeconds)` every animation frame while `running` is true.
 * The callback ref is updated every render so closures stay fresh.
 */
export function useAnimationFrame(cb: (dt: number, t: number) => void, running = true) {
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    if (!running) return
    let raf = 0
    let last = performance.now()
    const start = last
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      cbRef.current(dt, (now - start) / 1000)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [running])
}
