/** Format a number with an SI prefix, e.g. 0.0022 F -> "2.2 mF". */
export function si(value: number, unit: string, digits = 3): string {
  if (!isFinite(value)) return '∞ ' + unit
  if (value === 0) return `0 ${unit}`
  const abs = Math.abs(value)
  const prefixes: [number, string][] = [
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'µ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ]
  for (const [scale, p] of prefixes) {
    if (abs >= scale * 0.9995) {
      return `${trim(value / scale, digits)} ${p}${unit}`
    }
  }
  return `${trim(value / 1e-12, digits)} p${unit}`
}

/** Significant-digit formatting without trailing zeros. */
export function trim(v: number, digits = 3): string {
  if (!isFinite(v)) return '∞'
  const s = Number(v.toPrecision(digits))
  return String(s)
}

export function fixed(v: number, d = 2): string {
  return v.toFixed(d)
}

/** Map a slider position in [0,1] to a logarithmic range [min,max]. */
export function logFromSlider(p: number, min: number, max: number): number {
  return min * Math.pow(max / min, p)
}

export function sliderFromLog(v: number, min: number, max: number): number {
  return Math.log(v / min) / Math.log(max / min)
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
