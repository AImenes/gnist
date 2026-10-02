type Bar = { x: number; h: number; color?: string; label?: string; active?: boolean }

type Props = {
  bars: Bar[]
  xMax: number
  hMax: number
  width?: number
  height?: number
  xLabel?: string
  yLabel?: string
  /** Bar width in x-units. */
  barWidth?: number
  xFormat?: (v: number) => string
}

const PAD = { l: 44, r: 12, t: 16, b: 28 }

/** Stem/bar plot for a line spectrum: one bar per sine component. */
export function Spectrum({ bars, xMax, hMax, width = 640, height = 200, xLabel, yLabel, barWidth, xFormat = (v) => String(v) }: Props) {
  const w = width - PAD.l - PAD.r
  const h = height - PAD.t - PAD.b
  const tx = (x: number) => PAD.l + (x / xMax) * w
  const ty = (y: number) => PAD.t + h - (y / hMax) * h
  const bw = Math.max(3, ((barWidth ?? 0.6) / xMax) * w)
  const ticks = niceTicks(xMax)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((p) => (
        <line key={p} x1={PAD.l} x2={PAD.l + w} y1={ty(p * hMax)} y2={ty(p * hMax)} stroke="var(--grid)" />
      ))}
      <line x1={PAD.l} x2={PAD.l + w} y1={ty(0)} y2={ty(0)} stroke="var(--text-muted)" />
      {ticks.map((x) => (
        <text key={x} x={tx(x)} y={height - 10} fontSize={11} textAnchor="middle" fill="var(--text-muted)">
          {xFormat(x)}
        </text>
      ))}
      {[0, 0.5, 1].map((p) => (
        <text key={p} x={PAD.l - 6} y={ty(p * hMax) + 4} fontSize={11} textAnchor="end" fill="var(--text-muted)">
          {Math.round(p * hMax * 100) / 100}
        </text>
      ))}
      {xLabel && (
        <text x={PAD.l + w} y={height - 10} dy={-14} fontSize={11} textAnchor="end" fontWeight={600} fill="var(--text)">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={PAD.l + 6} y={PAD.t + 10} fontSize={11} fontWeight={600} fill="var(--text)">
          {yLabel}
        </text>
      )}
      {bars.map((b, i) => {
        const hh = Math.min(hMax, Math.abs(b.h))
        return (
          <g key={i} opacity={b.active === false ? 0.25 : 1}>
            <rect x={tx(b.x) - bw / 2} y={ty(hh)} width={bw} height={Math.max(0, ty(0) - ty(hh))} fill={b.color ?? 'var(--accent)'} rx={2} />
            <circle cx={tx(b.x)} cy={ty(hh)} r={3} fill={b.color ?? 'var(--accent)'} />
            {b.label && (
              <text x={tx(b.x)} y={ty(hh) - 7} fontSize={10} textAnchor="middle" fill="var(--text-muted)" style={{ fontFamily: 'var(--mono)' }}>
                {b.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function niceTicks(xMax: number): number[] {
  const step = xMax <= 12 ? 1 : xMax <= 30 ? 5 : xMax <= 60 ? 10 : 20
  const out: number[] = []
  for (let x = 0; x <= xMax; x += step) out.push(x)
  return out
}
