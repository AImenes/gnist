import { useEffect, useRef, type MutableRefObject } from 'react'
import { si } from '../../lib/format'
import { readPalette } from './draw'

export const SCOPE_LEN = 1024

export type ScopeBuffer = { v: Float32Array; i: Float32Array; idx: number; count: number }

export function newBuffer(): ScopeBuffer {
  return { v: new Float32Array(SCOPE_LEN), i: new Float32Array(SCOPE_LEN), idx: 0, count: 0 }
}

export function pushSample(b: ScopeBuffer, v: number, i: number) {
  b.v[b.idx] = v
  b.i[b.idx] = i
  b.idx = (b.idx + 1) % SCOPE_LEN
  b.count = Math.min(SCOPE_LEN, b.count + 1)
}

type Props = {
  id: string
  label: string
  buffers: MutableRefObject<Map<string, ScopeBuffer>>
  onRemove: () => void
  vLabel: string
  iLabel: string
  removeLabel: string
}

/** One oscilloscope channel: voltage (green) and current (amber) over the last SCOPE_LEN samples. */
export function Scope({ id, label, buffers, onRemove, vLabel, iLabel, removeLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const vmaxEl = useRef<HTMLSpanElement>(null)
  const imaxEl = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const wrap = wrapRef.current!
    let w = 300
    const h = 110
    const ro = new ResizeObserver(() => {
      w = Math.max(120, wrap.clientWidth)
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    })
    ro.observe(wrap)
    let raf = 0
    const loop = () => {
      const ctx = canvas.getContext('2d')
      const b = buffers.current.get(id)
      if (ctx) {
        const p = readPalette(canvas)
        const dpr = window.devicePixelRatio || 1
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.fillStyle = p.bg
        ctx.fillRect(0, 0, w, h)
        ctx.strokeStyle = p.grid
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let k = 1; k < 4; k++) {
          ctx.moveTo(0, (h * k) / 4)
          ctx.lineTo(w, (h * k) / 4)
        }
        for (let x = 0; x < w; x += w / 8) {
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
        }
        ctx.stroke()
        ctx.strokeStyle = p.muted
        ctx.beginPath()
        ctx.moveTo(0, h / 2)
        ctx.lineTo(w, h / 2)
        ctx.stroke()
        if (b && b.count > 1) {
          let vmax = 1e-9
          let imax = 1e-12
          for (let k = 0; k < b.count; k++) {
            vmax = Math.max(vmax, Math.abs(b.v[k]))
            imax = Math.max(imax, Math.abs(b.i[k]))
          }
          const trace = (arr: Float32Array, max: number, color: string) => {
            ctx.strokeStyle = color
            ctx.lineWidth = 1.8
            ctx.lineJoin = 'round'
            ctx.beginPath()
            const n = b.count
            const start = (b.idx - n + SCOPE_LEN) % SCOPE_LEN
            for (let k = 0; k < n; k++) {
              const val = arr[(start + k) % SCOPE_LEN]
              const x = w - ((n - 1 - k) * w) / (SCOPE_LEN - 1)
              const y = h / 2 - (val / max) * (h / 2 - 6)
              if (k === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
          }
          trace(b.v, vmax, p.pos)
          trace(b.i, imax, p.dot)
          if (vmaxEl.current) vmaxEl.current.textContent = si(vmax, 'V')
          if (imaxEl.current) imaxEl.current.textContent = si(imax, 'A')
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [id, buffers])

  return (
    <div className="scope" ref={wrapRef}>
      <div className="scope-head">
        <span className="scope-label">{label}</span>
        <span className="scope-max">
          <span style={{ color: 'var(--lab-pos)' }}>
            {vLabel} <span ref={vmaxEl}>–</span>
          </span>
          <span style={{ color: 'var(--lab-dot)' }}>
            {iLabel} <span ref={imaxEl}>–</span>
          </span>
        </span>
        <button className="scope-close" onClick={onRemove} title={removeLabel} aria-label={removeLabel}>
          ✕
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
