export type WaveKind = 'square' | 'sawtooth' | 'triangle'

export type Term = {
  /** Harmonic number n (multiple of the fundamental). */
  n: number
  /** Signed amplitude of sin(n·ωt). */
  a: number
}

/**
 * First `count` non-zero Fourier sine terms for the classic waveforms,
 * normalised so the target wave has peak 1.
 */
export function fourierTerms(kind: WaveKind, count: number): Term[] {
  const terms: Term[] = []
  switch (kind) {
    case 'square':
      // 4/π · Σ sin(nωt)/n, n odd
      for (let k = 0; k < count; k++) {
        const n = 2 * k + 1
        terms.push({ n, a: 4 / (Math.PI * n) })
      }
      break
    case 'sawtooth':
      // 2/π · Σ (−1)^(n+1) sin(nωt)/n, all n
      for (let k = 0; k < count; k++) {
        const n = k + 1
        terms.push({ n, a: ((2 / Math.PI) * (n % 2 === 1 ? 1 : -1)) / n })
      }
      break
    case 'triangle':
      // 8/π² · Σ (−1)^((n−1)/2) sin(nωt)/n², n odd
      for (let k = 0; k < count; k++) {
        const n = 2 * k + 1
        terms.push({ n, a: ((8 / (Math.PI * Math.PI)) * (k % 2 === 0 ? 1 : -1)) / (n * n) })
      }
      break
  }
  return terms
}

/** Ideal target waveform with period 2π, peak 1, matching the series phase. */
export function targetWave(kind: WaveKind, theta: number): number {
  const x = ((theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  switch (kind) {
    case 'square':
      return x < Math.PI ? 1 : -1
    case 'sawtooth':
      // 2/π Σ (−1)^(n+1) sin(nx)/n  ==  x/π on (−π, π)
      return x < Math.PI ? x / Math.PI : x / Math.PI - 2
    case 'triangle':
      // sin-series triangle: peak at π/2
      return x < Math.PI / 2 ? (2 * x) / Math.PI : x < (3 * Math.PI) / 2 ? 2 - (2 * x) / Math.PI : (2 * x) / Math.PI - 4
  }
}

export function sumTerms(terms: Term[], theta: number): number {
  let y = 0
  for (const { n, a } of terms) y += a * Math.sin(n * theta)
  return y
}
