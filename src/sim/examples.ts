import { newId, type Elem, type ElemType } from './types'

type Spec = [ElemType, number, number, number, number, number?, Record<string, unknown>?]

function make(specs: Spec[]): Elem[] {
  return specs.map(([type, x1, y1, x2, y2, value, extra]) => ({
    id: newId(),
    type,
    x1,
    y1,
    x2,
    y2,
    value: value ?? 0,
    ...(extra ?? {}),
  }))
}

export const EXAMPLES: Record<string, () => Elem[]> = {
  // Battery → switch → resistor → capacitor, like the classic RC charging circuit.
  rc: () =>
    make([
      ['dc', 8, 10, 8, 18, 9],
      ['wire', 8, 10, 12, 10],
      ['switch', 12, 10, 16, 10, 0, { closed: false }],
      ['wire', 16, 10, 20, 10],
      ['resistor', 20, 10, 26, 10, 1000],
      ['wire', 26, 10, 30, 10],
      ['capacitor', 30, 10, 30, 18, 100e-6],
      ['wire', 30, 18, 8, 18],
      ['ground', 19, 18, 19, 20],
    ]),
  // Series LRC ring with a battery to kick it, as in the Falstad "LRC Circuit" example.
  lrc: () =>
    make([
      ['resistor', 10, 8, 16, 8, 10],
      ['wire', 16, 8, 24, 8],
      ['wire', 24, 8, 24, 12],
      ['inductor', 24, 12, 24, 20, 1],
      ['wire', 24, 20, 24, 24],
      ['capacitor', 24, 24, 16, 24, 15e-6],
      ['wire', 16, 24, 10, 24],
      ['wire', 10, 24, 10, 8],
      ['switch', 24, 8, 30, 8, 0, { closed: true }],
      ['wire', 30, 8, 30, 12],
      ['dc', 30, 12, 30, 20, 10],
      ['wire', 30, 20, 30, 24],
      ['resistor', 30, 24, 24, 24, 100],
      ['ground', 20, 24, 20, 26],
    ]),
  divider: () =>
    make([
      ['dc', 10, 8, 10, 20, 12],
      ['wire', 10, 8, 18, 8],
      ['resistor', 18, 8, 18, 14, 1000],
      ['resistor', 18, 14, 18, 20, 2000],
      ['wire', 18, 20, 10, 20],
      ['ground', 14, 20, 14, 22],
    ]),
  acrc: () =>
    make([
      ['ac', 10, 8, 10, 18, 5, { freq: 50 }],
      ['wire', 10, 8, 16, 8],
      ['resistor', 16, 8, 22, 8, 100],
      ['wire', 22, 8, 26, 8],
      ['capacitor', 26, 8, 26, 18, 20e-6],
      ['wire', 26, 18, 10, 18],
      ['ground', 18, 18, 18, 20],
    ]),
  parallel: () =>
    make([
      ['dc', 8, 8, 8, 20, 12],
      ['wire', 8, 8, 28, 8],
      ['resistor', 14, 8, 14, 20, 100],
      ['resistor', 21, 8, 21, 20, 220],
      ['resistor', 28, 8, 28, 20, 470],
      ['wire', 8, 20, 28, 20],
      ['ground', 11, 20, 11, 22],
    ]),
}
