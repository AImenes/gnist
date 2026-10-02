import { useId } from 'react'

export type Series = {
  /** Points as [x, y]. */
  pts: [number, number][]
  color: string
  width?: number
  dash?: string
  opacity?: number
  label?: string
}

type Props = {
  series: Series[]
  xDomain: [number, number]
  yDomain: [number, number]
  width?: number
  height?: number
  xLabel?: string
  yLabel?: string
  /** Vertical dashed guide lines, with optional label. */
  xMarkers?: { x: number; label?: string; color?: string }[]
  yMarkers?: { y: number; label?: string; color?: string }[]
  /** Positions of grid lines; if omitted, 4 even divisions. */
  xTicks?: number[]
  yTicks?: number[]
  xFormat?: (v: number) => string
  yFormat?: (v: number) => string
  /** Draw a scanning cursor at this x position. */
  cursorX?: number
  logX?: boolean
  logY?: boolean
}

const PAD = { l: 48, r: 28, t: 12, b: 30 }

export function Plot({
  series,
  xDomain,
  yDomain,
  width = 640,
  height = 300,
  xLabel,
  yLabel,
  xMarkers = [],
  yMarkers = [],
  xTicks,
  yTicks,
  xFormat = (v) => String(Math.round(v * 100) / 100),
  yFormat = (v) => String(Math.round(v * 100) / 100),
  cursorX,
  logX,
  logY,
}: Props) {
  const clip = useId()
  const w = width - PAD.l - PAD.r
  const h = height - PAD.t - PAD.b

  const tx = (x: number) => {
    const [a, b] = xDomain
    const p = logX ? Math.log(x / a) / Math.log(b / a) : (x - a) / (b - a)
    return PAD.l + p * w
  }
  const ty = (y: number) => {
    const [a, b] = yDomain
    const p = logY ? Math.log(y / a) / Math.log(b / a) : (y - a) / (b - a)
    return PAD.t + h - p * h
  }

  const xt = xTicks ?? evenTicks(xDomain, 4)
  const yt = yTicks ?? evenTicks(yDomain, 4)

  const toPath = (pts: [number, number][]) => {
    let d = ''
    let pen = false
    for (const [x, y] of pts) {
      if (!isFinite(x) || !isFinite(y) || (logX && x <= 0) || (logY && y <= 0)) {
        pen = false
        continue
      }
      const X = tx(x)
      const Y = ty(y)
      d += (pen ? ' L' : ' M') + X.toFixed(1) + ' ' + Y.toFixed(1)
      pen = true
    }
    return d
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
      <defs>
        <clipPath id={clip}>
          <rect x={PAD.l} y={PAD.t} width={w} height={h} />
        </clipPath>
      </defs>
      {/* grid */}
      {xt.map((x) => (
        <line key={'x' + x} x1={tx(x)} x2={tx(x)} y1={PAD.t} y2={PAD.t + h} stroke="var(--grid)" />
      ))}
      {yt.map((y) => (
        <line key={'y' + y} x1={PAD.l} x2={PAD.l + w} y1={ty(y)} y2={ty(y)} stroke="var(--grid)" />
      ))}
      {/* zero axes if in range */}
      {!logY && yDomain[0] < 0 && yDomain[1] > 0 && (
        <line x1={PAD.l} x2={PAD.l + w} y1={ty(0)} y2={ty(0)} stroke="var(--text-muted)" strokeWidth={1} />
      )}
      {!logX && xDomain[0] < 0 && xDomain[1] > 0 && (
        <line y1={PAD.t} y2={PAD.t + h} x1={tx(0)} x2={tx(0)} stroke="var(--text-muted)" strokeWidth={1} />
      )}
      {/* tick labels */}
      {xt.map((x) => (
        <text key={'xl' + x} x={tx(x)} y={height - 12} fontSize={11} textAnchor="middle" fill="var(--text-muted)">
          {xFormat(x)}
        </text>
      ))}
      {yt.map((y) => (
        <text key={'yl' + y} x={PAD.l - 6} y={ty(y) + 4} fontSize={11} textAnchor="end" fill="var(--text-muted)">
          {yFormat(y)}
        </text>
      ))}
      {xLabel && (
        <text x={PAD.l + w} y={height - 12} fontSize={11} textAnchor="end" fill="var(--text)" fontWeight={600} dx={-2} dy={-14}>
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={PAD.l + 6} y={PAD.t + 12} fontSize={11} fill="var(--text)" fontWeight={600}>
          {yLabel}
        </text>
      )}
      {/* markers */}
      {xMarkers.map((m, i) => (
        <g key={'m' + i}>
          <line x1={tx(m.x)} x2={tx(m.x)} y1={PAD.t} y2={PAD.t + h} stroke={m.color ?? 'var(--text-muted)'} strokeDasharray="4 4" />
          {m.label && (
            <text x={tx(m.x) + 4} y={PAD.t + h - 6} fontSize={11} fill={m.color ?? 'var(--text-muted)'}>
              {m.label}
            </text>
          )}
        </g>
      ))}
      {yMarkers.map((m, i) => (
        <g key={'ym' + i}>
          <line y1={ty(m.y)} y2={ty(m.y)} x1={PAD.l} x2={PAD.l + w} stroke={m.color ?? 'var(--text-muted)'} strokeDasharray="4 4" />
          {m.label && (
            <text x={PAD.l + w - 4} y={ty(m.y) - 4} fontSize={11} textAnchor="end" fill={m.color ?? 'var(--text-muted)'}>
              {m.label}
            </text>
          )}
        </g>
      ))}
      {/* series */}
      <g clipPath={`url(#${clip})`}>
        {series.map((s, i) => (
          <path
            key={i}
            d={toPath(s.pts)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.width ?? 2.2}
            strokeDasharray={s.dash}
            opacity={s.opacity ?? 1}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {cursorX !== undefined && (
          <line x1={tx(cursorX)} x2={tx(cursorX)} y1={PAD.t} y2={PAD.t + h} stroke="var(--accent)" strokeWidth={1.5} opacity={0.8} />
        )}
      </g>
    </svg>
  )
}

function evenTicks([a, b]: [number, number], n: number): number[] {
  const out: number[] = []
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n)
  return out
}

/** Sample f over [a,b] into points. */
export function sample(f: (x: number) => number, a: number, b: number, n = 300): [number, number][] {
  const pts: [number, number][] = []
  for (let i = 0; i <= n; i++) {
    const x = a + ((b - a) * i) / n
    pts.push([x, f(x)])
  }
  return pts
}
