import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import { DEFAULTS, GRID, newId, type Elem, type ElemType } from '../../sim/types'
import type { SimResult } from '../../sim/engine'
import { drawElem, hitTest, readPalette, type Palette } from './draw'

export type Tool = 'select' | ElemType

type Drag =
  | { kind: 'none' }
  | { kind: 'move'; id: string; sx: number; sy: number; orig: Elem; moved: boolean }
  | { kind: 'endpoint'; id: string; which: 1 | 2 }
  | { kind: 'place'; type: ElemType; sx: number; sy: number; ex: number; ey: number }

type Props = {
  elems: Elem[]
  onChange: (elems: Elem[]) => void
  tool: Tool
  selectedId: string | null
  onSelect: (id: string | null) => void
  resultRef: MutableRefObject<SimResult | null>
  vmax: number
  currentSpeed: number
  iec: boolean
  minHeight?: number
}

/** Snap a target point so the segment from the fixed point is horizontal or vertical. */
function ortho(fx: number, fy: number, tx: number, ty: number): [number, number] {
  return Math.abs(tx - fx) >= Math.abs(ty - fy) ? [tx, fy] : [fx, ty]
}

export function Board({ elems, onChange, tool, selectedId, onSelect, resultRef, vmax, currentSpeed, iec, minHeight = 420 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const size = useRef({ w: 800, h: minHeight })
  const palette = useRef<Palette | null>(null)
  const drag = useRef<Drag>({ kind: 'none' })
  const [hoverId, setHoverId] = useState<string | null>(null)
  const dotOffsets = useRef(new Map<string, number>())
  const latest = useRef({ elems, selectedId, hoverId, tool, vmax, currentSpeed, iec })
  latest.current = { elems, selectedId, hoverId, tool, vmax, currentSpeed, iec }
  const [, force] = useState(0)

  // size to container
  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ro = new ResizeObserver(() => {
      const w = Math.max(320, wrap.clientWidth)
      const h = Math.max(minHeight, wrap.clientHeight)
      size.current = { w, h }
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      palette.current = readPalette(canvas)
    })
    ro.observe(wrap)
    const mo = new MutationObserver(() => {
      if (canvasRef.current) palette.current = readPalette(canvasRef.current)
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [minHeight])

  // render loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      draw(dt)
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function draw(dt: number) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const p = palette.current ?? (palette.current = readPalette(canvas))
    const { w, h } = size.current
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = p.bg
    ctx.fillRect(0, 0, w, h)
    // perfboard dots
    ctx.fillStyle = p.grid
    for (let x = GRID; x < w; x += GRID)
      for (let y = GRID; y < h; y += GRID) {
        ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5)
      }

    const { elems, selectedId, hoverId, vmax, currentSpeed, iec } = latest.current
    const res = resultRef.current
    for (const e of elems) {
      const [v1, v2] = res?.volts.get(e.id) ?? [0, 0]
      const i = res?.amps.get(e.id) ?? 0
      const off = (dotOffsets.current.get(e.id) ?? 0) + i * currentSpeed * 160 * dt
      dotOffsets.current.set(e.id, off)
      drawElem(ctx, e, { v1, v2, i, vmax, p, selected: e.id === selectedId, hover: e.id === hoverId && e.id !== selectedId, iec, dotOffset: off })
    }
    const d = drag.current
    if (d.kind === 'place') {
      const [ex, ey] = d.type === 'ground' ? [d.sx, d.sy + 2] : ortho(d.sx, d.sy, d.ex, d.ey)
      if (ex !== d.sx || ey !== d.sy) {
        const pe: Elem = { id: 'preview', type: d.type, x1: d.sx, y1: d.sy, x2: ex, y2: ey, value: 0, closed: false }
        drawElem(ctx, pe, { v1: 0, v2: 0, i: 0, vmax, p, selected: false, hover: false, iec, dotOffset: 0, preview: true })
      }
    }
  }

  const toGrid = (ev: React.PointerEvent): [number, number, number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect()
    const px = ev.clientX - rect.left
    const py = ev.clientY - rect.top
    return [px, py, Math.round(px / GRID), Math.round(py / GRID)]
  }

  const onPointerDown = (ev: React.PointerEvent) => {
    if (ev.button !== 0 && ev.pointerType === 'mouse') {
      if (ev.button === 2) return // context menu handled separately
    }
    const canvas = canvasRef.current!
    canvas.setPointerCapture(ev.pointerId)
    const [px, py, gx, gy] = toGrid(ev)
    const { elems, tool, selectedId } = latest.current
    if (tool === 'select') {
      // endpoint handle of the selected element?
      const sel = elems.find((e) => e.id === selectedId)
      if (sel) {
        const d1 = Math.hypot(px - sel.x1 * GRID, py - sel.y1 * GRID)
        const d2 = Math.hypot(px - sel.x2 * GRID, py - sel.y2 * GRID)
        if (d1 < 9 || d2 < 9) {
          drag.current = { kind: 'endpoint', id: sel.id, which: d1 <= d2 ? 1 : 2 }
          return
        }
      }
      const hit = hitTest(elems, px, py)
      if (hit) {
        onSelect(hit.id)
        drag.current = { kind: 'move', id: hit.id, sx: gx, sy: gy, orig: { ...hit }, moved: false }
      } else {
        onSelect(null)
      }
    } else if (tool === 'ground') {
      const g: Elem = { id: newId(), type: 'ground', x1: gx, y1: gy, x2: gx, y2: gy + 2, value: 0 }
      onChange([...latest.current.elems, g])
      onSelect(g.id)
    } else {
      drag.current = { kind: 'place', type: tool, sx: gx, sy: gy, ex: gx, ey: gy }
    }
  }

  const onPointerMove = (ev: React.PointerEvent) => {
    const [px, py, gx, gy] = toGrid(ev)
    const d = drag.current
    const { elems } = latest.current
    if (d.kind === 'none') {
      if (latest.current.tool === 'select') {
        const hit = hitTest(elems, px, py)
        const id = hit?.id ?? null
        if (id !== latest.current.hoverId) setHoverId(id)
      }
      return
    }
    if (d.kind === 'move') {
      const dx = gx - d.sx
      const dy = gy - d.sy
      if (dx === 0 && dy === 0 && !d.moved) return
      d.moved = d.moved || dx !== 0 || dy !== 0
      onChange(elems.map((e) => (e.id === d.id ? { ...e, x1: d.orig.x1 + dx, y1: d.orig.y1 + dy, x2: d.orig.x2 + dx, y2: d.orig.y2 + dy } : e)))
    } else if (d.kind === 'endpoint') {
      const e = elems.find((x) => x.id === d.id)
      if (!e) return
      const [fx, fy] = d.which === 1 ? [e.x2, e.y2] : [e.x1, e.y1]
      const [nx, ny] = ortho(fx, fy, gx, gy)
      if (nx === fx && ny === fy) return
      const upd = d.which === 1 ? { x1: nx, y1: ny } : { x2: nx, y2: ny }
      if ((d.which === 1 && (e.x1 !== nx || e.y1 !== ny)) || (d.which === 2 && (e.x2 !== nx || e.y2 !== ny))) {
        onChange(elems.map((x) => (x.id === d.id ? { ...x, ...upd } : x)))
      }
    } else if (d.kind === 'place') {
      d.ex = gx
      d.ey = gy
      force((n) => n + 1)
    }
  }

  const onPointerUp = (ev: React.PointerEvent) => {
    const d = drag.current
    const { elems } = latest.current
    canvasRef.current?.releasePointerCapture(ev.pointerId)
    if (d.kind === 'move' && !d.moved) {
      const e = elems.find((x) => x.id === d.id)
      if (e?.type === 'switch') onChange(elems.map((x) => (x.id === e.id ? { ...x, closed: !x.closed } : x)))
    } else if (d.kind === 'place') {
      const [ex, ey] = ortho(d.sx, d.sy, d.ex, d.ey)
      const len = Math.abs(ex - d.sx) + Math.abs(ey - d.sy)
      if (len >= 2) {
        const e: Elem = { id: newId(), type: d.type, x1: d.sx, y1: d.sy, x2: ex, y2: ey, value: 0, ...DEFAULTS[d.type] }
        onChange([...elems, e])
        onSelect(e.id)
      }
    }
    drag.current = { kind: 'none' }
    force((n) => n + 1)
  }

  const cursor = tool === 'select' ? (drag.current.kind !== 'none' ? 'grabbing' : hoverId ? 'pointer' : 'default') : 'crosshair'

  return (
    <div ref={wrapRef} className="lab-board" style={{ minHeight }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor, touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  )
}
