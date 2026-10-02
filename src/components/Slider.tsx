import { useId } from 'react'
import { logFromSlider, sliderFromLog } from '../lib/format'

type Props = {
  label: string
  symbol?: string
  value: number
  min: number
  max: number
  step?: number
  /** Logarithmic mapping between slider position and value. */
  log?: boolean
  onChange: (v: number) => void
  format: (v: number) => string
  disabled?: boolean
  hint?: string
}

export function Slider({ label, symbol, value, min, max, step, log, onChange, format, disabled, hint }: Props) {
  const id = useId()
  const pos = log ? sliderFromLog(value, min, max) : (value - min) / (max - min)
  const fill = `${Math.round(Math.max(0, Math.min(1, pos)) * 100)}%`

  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id} className="slider-label">
          {label}
          {hint && <span className="muted"> · {hint}</span>}
        </label>
        <span className="slider-value">
          {symbol && <span className="sym">{symbol}</span>}
          {format(value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={log ? 0 : min}
        max={log ? 1 : max}
        step={log ? 0.001 : step ?? (max - min) / 200}
        value={log ? pos : value}
        disabled={disabled}
        style={{ ['--fill' as string]: fill }}
        onChange={(e) => {
          const p = Number(e.target.value)
          onChange(log ? logFromSlider(p, min, max) : p)
        }}
      />
    </div>
  )
}
