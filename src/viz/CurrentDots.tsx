import { useEffect, useRef, useState } from 'react'
import { useAnimationFrame } from '../lib/useAnimationFrame'

type Props = {
  /** SVG path data the dots travel along. */
  d: string
  /** Current in arbitrary units; 1.0 ≈ comfortable speed. Negative reverses direction. */
  current: number
  /** Dot spacing in px at current = 1. */
  spacing?: number
  color?: string
  radius?: number
  running?: boolean
}

/**
 * Animated dots travelling along an SVG path. Speed scales with |current|; dot density grows
 * mildly with it too so a bigger current "looks" bigger without becoming a blur.
 */
export function CurrentDots({ d, current, spacing = 26, color = 'var(--accent)', radius = 3.2, running = true }: Props) {
  const pathRef = useRef<SVGPathElement>(null)
  const groupRef = useRef<SVGGElement>(null)
  const offset = useRef(0)
  const [len, setLen] = useState(0)

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength())
  }, [d])

  const mag = Math.abs(current)
  // Density: 1 dot per `spacing` px at |I|=1, more at higher current, capped.
  const density = Math.min(3, 0.6 + mag * 0.5)
  const n = len > 0 ? Math.max(1, Math.round((len / spacing) * density)) : 0

  useAnimationFrame((dt) => {
    const path = pathRef.current
    const g = groupRef.current
    if (!path || !g || len === 0) return
    const speed = 70 * current // px per second
    offset.current = (offset.current + speed * dt) % len
    if (offset.current < 0) offset.current += len
    const children = g.children
    const step = len / n
    for (let i = 0; i < children.length; i++) {
      const s = (offset.current + i * step) % len
      const p = path.getPointAtLength(s)
      const c = children[i] as SVGCircleElement
      c.setAttribute('cx', p.x.toFixed(1))
      c.setAttribute('cy', p.y.toFixed(1))
    }
  }, running && mag > 1e-6)

  return (
    <>
      <path ref={pathRef} d={d} fill="none" stroke="none" />
      <g ref={groupRef} style={{ opacity: mag < 1e-6 ? 0 : 1, transition: 'opacity 0.3s' }}>
        {Array.from({ length: n }, (_, i) => (
          <circle key={i} r={radius} fill={color} />
        ))}
      </g>
    </>
  )
}
