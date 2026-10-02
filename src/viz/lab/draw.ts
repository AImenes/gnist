import { GRID, type Elem } from '../../sim/types'
import { si } from '../../lib/format'

export type Palette = {
  bg: string
  grid: string
  stroke: string
  muted: string
  accent: string
  pos: string
  neg: string
  text: string
  dot: string
}

/** Read the board palette from CSS custom properties (must resolve to #rrggbb). */
export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el)
  const g = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb
  return {
    bg: g('--lab-bg', '#0b0d10'),
    grid: g('--lab-grid', '#1b2027'),
    stroke: g('--lab-stroke', '#e6ebf0'),
    muted: g('--lab-muted', '#6b7682'),
    accent: g('--lab-accent', '#ffb000'),
    pos: g('--lab-pos', '#4dff6a'),
    neg: g('--lab-neg', '#ff4d4d'),
    text: g('--lab-text', '#c9d1d9'),
    dot: g('--lab-dot', '#ffc83d'),
  }
}

function hexToRgb(h: string): [number, number, number] {
  const s = h.replace('#', '')
  const n = parseInt(s.length === 3 ? s.split('').map((c) => c + c).join('') : s, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

export function voltColor(v: number, vmax: number, p: Palette): string {
  const t = Math.min(1, Math.abs(v) / Math.max(vmax, 1e-9))
  if (t < 0.02) return p.muted
  return mix(p.muted, v > 0 ? p.pos : p.neg, 0.25 + 0.75 * t)
}

export const SYM = 36 // symbol length in px

export type DrawOpts = {
  v1: number
  v2: number
  i: number
  vmax: number
  p: Palette
  selected: boolean
  hover: boolean
  iec: boolean
  dotOffset: number
  preview?: boolean
}

export function elemLabel(e: Elem): string {
  switch (e.type) {
    case 'resistor':
      return si(e.value, 'Ω')
    case 'capacitor':
      return si(e.value, 'F')
    case 'inductor':
      return si(e.value, 'H')
    case 'dc':
      return si(e.value, 'V')
    case 'ac':
      return `${si(e.value, 'V')} · ${si(e.freq ?? 50, 'Hz')}`
    default:
      return ''
  }
}

export function drawElem(ctx: CanvasRenderingContext2D, e: Elem, o: DrawOpts) {
  const x1 = e.x1 * GRID
  const y1 = e.y1 * GRID
  const x2 = e.x2 * GRID
  const y2 = e.y2 * GRID
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  if (len === 0) return
  const ang = Math.atan2(dy, dx)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const c1 = o.preview ? o.p.accent : voltColor(o.v1, o.vmax, o.p)
  const c2 = o.preview ? o.p.accent : voltColor(o.v2, o.vmax, o.p)
  const sym = o.selected ? o.p.accent : o.preview ? o.p.accent : o.p.stroke

  // selection / hover halo
  if (o.selected || o.hover) {
    ctx.save()
    ctx.strokeStyle = o.p.accent
    ctx.globalAlpha = o.selected ? 0.28 : 0.14
    ctx.lineWidth = o.selected ? 12 : 10
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.restore()
  }

  ctx.save()
  ctx.translate(mx, my)
  ctx.rotate(ang)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  if (o.preview) ctx.setLineDash([4, 4])
  const h = len / 2
  const s = Math.min(SYM, len - 4) / 2 // half symbol length

  const lead = (from: number, to: number, color: string) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2.2
    ctx.beginPath()
    ctx.moveTo(from, 0)
    ctx.lineTo(to, 0)
    ctx.stroke()
  }

  switch (e.type) {
    case 'wire':
      lead(-h, h, c1)
      break
    case 'ground': {
      // hangs from terminal 1 towards terminal 2
      ctx.strokeStyle = c1
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.moveTo(-h, 0)
      ctx.lineTo(-h + 12, 0)
      ctx.stroke()
      ctx.strokeStyle = sym
      ctx.lineWidth = 2.4
      const bars: [number, number][] = [
        [-h + 12, 11],
        [-h + 17, 7],
        [-h + 22, 3],
      ]
      for (const [bx, bh] of bars) {
        ctx.beginPath()
        ctx.moveTo(bx, -bh)
        ctx.lineTo(bx, bh)
        ctx.stroke()
      }
      break
    }
    case 'resistor':
      lead(-h, -s, c1)
      lead(s, h, c2)
      ctx.strokeStyle = sym
      ctx.lineWidth = 2.2
      if (o.iec) {
        ctx.fillStyle = o.p.bg
        ctx.fillRect(-s, -6, 2 * s, 12)
        ctx.strokeRect(-s, -6, 2 * s, 12)
      } else {
        ctx.beginPath()
        ctx.moveTo(-s, 0)
        const n = 6
        const w = (2 * s) / n
        for (let k = 0; k < n; k++) {
          ctx.lineTo(-s + w * (k + 0.5), k % 2 === 0 ? -6 : 6)
        }
        ctx.lineTo(s, 0)
        ctx.stroke()
      }
      break
    case 'capacitor':
      lead(-h, -4, c1)
      lead(4, h, c2)
      ctx.strokeStyle = sym
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-4, -11)
      ctx.lineTo(-4, 11)
      ctx.moveTo(4, -11)
      ctx.lineTo(4, 11)
      ctx.stroke()
      break
    case 'inductor': {
      lead(-h, -s, c1)
      lead(s, h, c2)
      ctx.strokeStyle = sym
      ctx.lineWidth = 2.2
      ctx.beginPath()
      const n = 4
      const r = s / n
      for (let k = 0; k < n; k++) ctx.arc(-s + r * (2 * k + 1), 0, r, Math.PI, 0, false)
      ctx.stroke()
      break
    }
    case 'dc':
      lead(-h, -5, c1)
      lead(5, h, c2)
      ctx.strokeStyle = sym
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.moveTo(-5, -12)
      ctx.lineTo(-5, 12)
      ctx.stroke()
      ctx.lineWidth = 5
      ctx.beginPath()
      ctx.moveTo(5, -6)
      ctx.lineTo(5, 6)
      ctx.stroke()
      // + sign near terminal 1
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(-15, -14)
      ctx.lineTo(-9, -14)
      ctx.moveTo(-12, -17)
      ctx.lineTo(-12, -11)
      ctx.stroke()
      break
    case 'ac':
      lead(-h, -12, c1)
      lead(12, h, c2)
      ctx.strokeStyle = sym
      ctx.fillStyle = o.p.bg
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.arc(0, 0, 12, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.lineWidth = 1.8
      ctx.beginPath()
      for (let k = 0; k <= 16; k++) {
        const x = -7 + (14 * k) / 16
        const y = -6 * Math.sin((k / 16) * Math.PI * 2)
        if (k === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      break
    case 'switch': {
      lead(-h, -12, c1)
      lead(12, h, c2)
      ctx.fillStyle = sym
      ctx.beginPath()
      ctx.arc(-12, 0, 2.6, 0, Math.PI * 2)
      ctx.arc(12, 0, 2.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = e.closed ? sym : o.p.accent
      ctx.lineWidth = 2.6
      ctx.beginPath()
      ctx.moveTo(-12, 0)
      if (e.closed) ctx.lineTo(12, 0)
      else ctx.lineTo(8, -13)
      ctx.stroke()
      break
    }
  }

  // current dots
  if (!o.preview && Math.abs(o.i) > 1e-7) {
    const spacing = 14
    ctx.fillStyle = o.p.dot
    let off = o.dotOffset % spacing
    if (off < 0) off += spacing
    for (let x = -h + off; x <= h; x += spacing) {
      ctx.beginPath()
      ctx.arc(x, 0, 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()

  // endpoint handles
  if (o.selected) {
    ctx.fillStyle = o.p.accent
    for (const [px, py] of [
      [x1, y1],
      [x2, y2],
    ]) {
      ctx.beginPath()
      ctx.arc(px, py, 4, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // label
  const label = elemLabel(e)
  if (label && !o.preview) {
    const nx = -Math.sin(ang)
    const ny = Math.cos(ang)
    // keep labels above horizontal elements and right of vertical ones
    const flip = nx < -0.01 || (Math.abs(nx) < 0.01 && ny > 0) ? -1 : 1
    const lx = mx + nx * 20 * flip
    const ly = my + ny * 20 * flip
    ctx.fillStyle = o.selected ? o.p.accent : o.p.text
    ctx.font = '11px var(--mono), ui-monospace, monospace'
    ctx.textAlign = Math.abs(nx) > 0.5 ? (nx * flip > 0 ? 'left' : 'right') : 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, lx, ly)
  }
}

/** Distance from point to the segment of an element, in px. */
export function distToElem(e: Elem, px: number, py: number): number {
  const x1 = e.x1 * GRID
  const y1 = e.y1 * GRID
  const x2 = e.x2 * GRID
  const y2 = e.y2 * GRID
  const dx = x2 - x1
  const dy = y2 - y1
  const l2 = dx * dx + dy * dy
  let t = l2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / l2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

export function hitTest(elems: Elem[], px: number, py: number, tol = 7): Elem | null {
  let best: Elem | null = null
  let bestD = tol
  // components win over wires at equal distance; iterate so later (top-most) wins ties
  for (const e of elems) {
    const d = distToElem(e, px, py) - (e.type === 'wire' ? 0 : 1)
    if (d <= bestD) {
      best = e
      bestD = d
    }
  }
  return best
}
