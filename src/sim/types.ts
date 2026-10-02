export type ElemType = 'wire' | 'resistor' | 'capacitor' | 'inductor' | 'dc' | 'ac' | 'switch' | 'ground'

/** A two-terminal element drawn between two grid points. Terminal 1 is (x1,y1), terminal 2 is (x2,y2). */
export interface Elem {
  id: string
  type: ElemType
  x1: number
  y1: number
  x2: number
  y2: number
  /** R in Ω, C in F, L in H, DC volts, AC peak volts. */
  value: number
  /** AC frequency in Hz. */
  freq?: number
  /** Switch state. */
  closed?: boolean
}

export interface Circuit {
  elems: Elem[]
}

export const GRID = 16

export const DEFAULTS: Record<ElemType, Partial<Elem>> = {
  wire: { value: 0 },
  resistor: { value: 100 },
  capacitor: { value: 10e-6 },
  inductor: { value: 0.1 },
  dc: { value: 9 },
  ac: { value: 5, freq: 50 },
  switch: { value: 0, closed: false },
  ground: { value: 0 },
}

let counter = 1
export function newId(): string {
  return 'e' + (counter++).toString(36) + Math.random().toString(36).slice(2, 6)
}

export const UNIT: Record<ElemType, string> = {
  wire: '',
  resistor: 'Ω',
  capacitor: 'F',
  inductor: 'H',
  dc: 'V',
  ac: 'V',
  switch: '',
  ground: '',
}

/** Slider ranges for the property editor (log scale). */
export const RANGE: Partial<Record<ElemType, [number, number]>> = {
  resistor: [1, 1e6],
  capacitor: [1e-9, 1e-2],
  inductor: [1e-4, 10],
  dc: [0.1, 100],
  ac: [0.1, 100],
}
