import { useEffect, useRef } from 'react'
import { sumTerms, targetWave, type Term, type WaveKind } from '../lib/fourier'
import { useAnimationFrame } from '../lib/useAnimationFrame'

type Props = {
  terms: Term[]
  kind: WaveKind
  /** Angular speed of the fundamental, rad/s. */
  omega: number
  running: boolean
  showTarget: boolean
  /** Bumps to reset the trace. */
  resetKey?: number
}

const PERIODS_SHOWN = 2.5

/**
 * The classic Fourier epicycle animation: each term is an arm of length a·n rotating at n·ω,
 * chained tip to tail. The y-coordinate of the final tip is traced over time on the right.
 * Rendered on a canvas; the arm/circle drawing happens every frame.
 */
export function Epicycles({ terms, kind, omega, running, showTarget, resetKey }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const theta = useRef(0)
  // history of [theta, y], newest last
  const hist = useRef<[number, number][]>([])
  const size = useRef({ w: 800, h: 360 })
  const propsRef = useRef({ terms, kind, omega, showTarget })
  propsRef.current = { terms, kind, omega, showTarget }

  // Resize with the container.
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ro = new ResizeObserver(() => {
      const w = Math.max(320, wrap.clientWidth)
      const h = Math.round(Math.min(420, Math.max(260, w * 0.44)))
      size.current = { w, h }
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      draw()
    })
    ro.observe(wrap)
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    hist.current = []
    theta.current = 0
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, kind])

  useEffect(() => {
    draw()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terms, showTarget])

  useAnimationFrame((dt) => {
    const { terms, omega } = propsRef.current
    const maxN = terms.length ? terms[terms.length - 1].n : 1
    const dTheta = omega * dt
    // sub-step so the fastest arm never moves more than ~0.2 rad between samples
    const steps = Math.max(1, Math.ceil((maxN * dTheta) / 0.2))
    for (let s = 0; s < steps; s++) {
      theta.current += dTheta / steps
      hist.current.push([theta.current, sumTerms(terms, theta.current)])
    }
    // prune
    const span = PERIODS_SHOWN * 2 * Math.PI
    const h = hist.current
    let cut = 0
    while (cut < h.length && h[cut][0] < theta.current - span) cut++
    if (cut > 0) hist.current = h.slice(cut)
    draw()
  }, running)

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { w, h } = size.current
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const css = getComputedStyle(canvas)
    const cText = css.getPropertyValue('--text').trim() || '#fff'
    const cMuted = css.getPropertyValue('--text-muted').trim() || '#999'
    const cGrid = css.getPropertyValue('--grid').trim() || '#333'
    const cAccent = css.getPropertyValue('--accent').trim() || '#fb3'
    const cBlue = css.getPropertyValue('--blue').trim() || '#5cf'

    const { terms, kind, showTarget } = propsRef.current
    const th = theta.current
    const cx = Math.round(w * 0.22)
    const cy = h / 2
    const amp = Math.min(h * 0.32, (cx - 6) / 1.3)
    const traceX0 = Math.round(w * 0.5)
    const traceW = w - traceX0 - 12
    const pxPerRad = traceW / (PERIODS_SHOWN * 2 * Math.PI)

    // --- grid / axes
    ctx.strokeStyle = cGrid
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(traceX0, cy)
    ctx.lineTo(w, cy)
    ctx.moveTo(0, cy)
    ctx.lineTo(cx, cy)
    ctx.moveTo(cx, 0)
    ctx.lineTo(cx, h)
    for (const lv of [1, -1]) {
      ctx.moveTo(traceX0, cy - lv * amp)
      ctx.lineTo(w, cy - lv * amp)
    }
    ctx.stroke()
    ctx.fillStyle = cMuted
    ctx.font = '11px ui-monospace, monospace'
    ctx.textAlign = 'right'
    ctx.fillText('+1', w - 6, cy - amp - 4)
    ctx.fillText('−1', w - 6, cy + amp + 13)
    ctx.textAlign = 'right'
    ctx.fillText('t →', w - 6, h - 8)

    // --- target
    if (showTarget) {
      ctx.save()
      ctx.setLineDash([5, 5])
      ctx.strokeStyle = cMuted
      ctx.lineWidth = 1.5
      ctx.beginPath()
      let prev = NaN
      for (let px = 0; px <= traceW; px++) {
        const t = th - px / pxPerRad
        const y = targetWave(kind, t)
        const Y = cy - y * amp
        // break the line on jumps (square wave edges)
        if (px === 0 || Math.abs(y - prev) > 1) ctx.moveTo(traceX0 + px, Y)
        else ctx.lineTo(traceX0 + px, Y)
        prev = y
      }
      ctx.stroke()
      ctx.restore()
    }

    // --- arms & circles
    let x = cx
    let y = cy
    ctx.lineWidth = 1
    for (const { n, a } of terms) {
      const r = Math.abs(a) * amp
      const ang = n * th + (a < 0 ? Math.PI : 0)
      ctx.strokeStyle = cMuted
      ctx.globalAlpha = 0.45
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.globalAlpha = 1
      const nx = x + r * Math.cos(ang)
      const ny = y - r * Math.sin(ang)
      ctx.strokeStyle = cAccent
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(nx, ny)
      ctx.stroke()
      ctx.lineWidth = 1
      x = nx
      y = ny
    }
    // tip
    ctx.fillStyle = cAccent
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // connector from tip to the trace start
    ctx.save()
    ctx.setLineDash([3, 4])
    ctx.strokeStyle = cMuted
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(traceX0, y)
    ctx.stroke()
    ctx.restore()

    // --- trace
    const hs = hist.current
    if (hs.length > 1) {
      ctx.strokeStyle = cBlue
      ctx.lineWidth = 2.2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      for (let i = hs.length - 1; i >= 0; i--) {
        const [t0, y0] = hs[i]
        const X = traceX0 + (th - t0) * pxPerRad
        if (X > w) break
        const Y = cy - y0 * amp
        if (i === hs.length - 1) ctx.moveTo(X, Y)
        else ctx.lineTo(X, Y)
      }
      ctx.stroke()
    }
    // current point on trace
    ctx.fillStyle = cBlue
    ctx.beginPath()
    ctx.arc(traceX0, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // label for the circle region
    ctx.fillStyle = cText
    ctx.textAlign = 'left'
    ctx.font = '600 11px system-ui, sans-serif'
  }

  return (
    <div ref={wrapRef} style={{ width: '100%' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}
