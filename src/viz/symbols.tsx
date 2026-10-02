/**
 * Circuit symbols drawn in a local coordinate system, horizontal, centred on (0,0),
 * occupying x ∈ [-30, 30]. Wrap in <g transform="translate(x y) rotate(a)">.
 * Norwegian textbooks use the IEC rectangle for resistors; English ones the ANSI zigzag.
 */
import { useT } from '../i18n'

const stroke = 'var(--text)'

export function ResistorSymbol({ x, y, rotate = 0, label }: { x: number; y: number; rotate?: number; label?: string }) {
  const { lang } = useT()
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-20} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={20} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      {lang === 'nb' ? (
        <rect x={-20} y={-7} width={40} height={14} fill="var(--bg-elev)" stroke={stroke} strokeWidth={2} />
      ) : (
        <polyline
          points="-20,0 -17,-7 -11,7 -5,-7 1,7 7,-7 13,7 17,0 20,0"
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
        />
      )}
      {label && <Label rotate={rotate}>{label}</Label>}
    </g>
  )
}

export function CapacitorSymbol({ x, y, rotate = 0, label }: { x: number; y: number; rotate?: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-4} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={4} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={-4} y1={-12} x2={-4} y2={12} stroke={stroke} strokeWidth={3} />
      <line x1={4} y1={-12} x2={4} y2={12} stroke={stroke} strokeWidth={3} />
      {label && <Label rotate={rotate}>{label}</Label>}
    </g>
  )
}

export function InductorSymbol({ x, y, rotate = 0, label }: { x: number; y: number; rotate?: number; label?: string }) {
  const bumps = 4
  const w = 40 / bumps
  let d = `M -20 0`
  for (let i = 0; i < bumps; i++) {
    const x0 = -20 + i * w
    d += ` A ${w / 2} ${w / 2} 0 0 1 ${x0 + w} 0`
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-20} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={20} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} />
      {label && <Label rotate={rotate}>{label}</Label>}
    </g>
  )
}

export function BatterySymbol({ x, y, rotate = 0, label }: { x: number; y: number; rotate?: number; label?: string }) {
  // Long thin line = +, short thick line = −. Positive terminal on the left (towards −x).
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-5} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={5} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={-5} y1={-14} x2={-5} y2={14} stroke={stroke} strokeWidth={2} />
      <line x1={5} y1={-7} x2={5} y2={7} stroke={stroke} strokeWidth={5} />
      <text x={-14} y={-18} fontSize={12} fill="var(--text-muted)" textAnchor="middle" transform={`rotate(${-rotate} -14 -18)`}>
        +
      </text>
      {label && <Label rotate={rotate}>{label}</Label>}
    </g>
  )
}

export function SwitchSymbol({ x, y, rotate = 0, closed }: { x: number; y: number; rotate?: number; closed: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-14} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={14} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      <circle cx={-14} cy={0} r={2.5} fill={stroke} />
      <circle cx={14} cy={0} r={2.5} fill={stroke} />
      <line
        x1={-14}
        y1={0}
        x2={closed ? 14 : 10}
        y2={closed ? 0 : -14}
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        style={{ transition: 'all 0.25s ease' }}
      />
    </g>
  )
}

function Label({ children, rotate }: { children: string; rotate: number }) {
  // Keep the label upright regardless of the symbol rotation.
  return (
    <text
      x={0}
      y={-16}
      fontSize={13}
      fontWeight={600}
      fill="var(--text)"
      textAnchor="middle"
      transform={`rotate(${-rotate} 0 -16)`}
      style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}
    >
      {children}
    </text>
  )
}

export function GroundSymbol({ x, y, rotate = 0 }: { x: number; y: number; rotate?: number }) {
  // Terminal at (-30,0) side is unused; the symbol hangs from (0,-14) downwards when rotate=0.
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={0} y1={-16} x2={0} y2={-4} stroke={stroke} strokeWidth={2} />
      <line x1={-12} y1={-4} x2={12} y2={-4} stroke={stroke} strokeWidth={2.5} />
      <line x1={-8} y1={2} x2={8} y2={2} stroke={stroke} strokeWidth={2.5} />
      <line x1={-4} y1={8} x2={4} y2={8} stroke={stroke} strokeWidth={2.5} />
    </g>
  )
}

export function AcSymbol({ x, y, rotate = 0, label }: { x: number; y: number; rotate?: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <line x1={-30} y1={0} x2={-12} y2={0} stroke={stroke} strokeWidth={2} />
      <line x1={12} y1={0} x2={30} y2={0} stroke={stroke} strokeWidth={2} />
      <circle cx={0} cy={0} r={12} fill="var(--bg-elev)" stroke={stroke} strokeWidth={2} />
      <path d="M -7 0 Q -3.5 -8 0 0 T 7 0" fill="none" stroke={stroke} strokeWidth={1.8} />
      {label && <Label rotate={rotate}>{label}</Label>}
    </g>
  )
}
