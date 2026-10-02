import type { Circuit, Elem } from './types'

/**
 * Transient circuit simulator using Modified Nodal Analysis with trapezoidal
 * companion models for capacitors and inductors. Linear elements only, so each
 * time step is one LU back-substitution; the matrix is factored once per topology.
 *
 * Conventions: element current i flows from terminal 1 to terminal 2 inside the
 * element, v = v1 − v2. For a DC source, terminal 1 is the + terminal.
 */

export interface ElemState {
  v: number
  i: number
}

export interface SimResult {
  /** Voltage at each terminal, keyed by elem id: [v1, v2]. */
  volts: Map<string, [number, number]>
  /** Element current (1→2). */
  amps: Map<string, number>
  time: number
  error: string | null
}

type Built = {
  n: number // unknowns
  lu: LU | null
  rhsBase: Float64Array
  // per element info
  nodeOf: Map<string, [number, number]> // node index (−1 = reference/ground) per terminal
  rows: {
    elem: Elem
    kind: 'g' | 'src' | 'dyn' | 'none'
    g?: number // conductance for resistor / companion
    j?: number // branch index for sources & wires
  }[]
  nodeCount: number
}

export class Simulator {
  private built: Built | null = null
  private states = new Map<string, ElemState>()
  private topoKey = ''
  time = 0
  dt = 5e-6
  error: string | null = null
  private x = new Float64Array(0)

  constructor(private circuit: Circuit) {}

  /** Swap in the current drawing; a rebuild happens only if its topology key changed. */
  setCircuit(c: Circuit) {
    this.circuit = c
  }

  setDt(dt: number) {
    if (dt !== this.dt) {
      this.dt = dt
      this.built = null
    }
  }

  reset() {
    this.time = 0
    this.states.clear()
    this.built = null
    this.error = null
  }

  /** Rebuild if the topology changed (elements added/removed, switch toggled, value changed). */
  private ensureBuilt() {
    const key = this.circuit.elems
      .map((e) => `${e.id}:${e.type}:${e.x1},${e.y1},${e.x2},${e.y2}:${e.value}:${e.freq ?? ''}:${e.closed ? 1 : 0}`)
      .join('|') + `#${this.dt}`
    if (this.built && key === this.topoKey) return
    this.topoKey = key
    this.built = this.build()
    // drop states of removed elements
    const ids = new Set(this.circuit.elems.map((e) => e.id))
    for (const k of [...this.states.keys()]) if (!ids.has(k)) this.states.delete(k)
  }

  private build(): Built {
    const elems = this.circuit.elems
    // --- 1. points → provisional node ids
    const pointId = new Map<string, number>()
    const pid = (x: number, y: number) => {
      const k = `${x},${y}`
      let v = pointId.get(k)
      if (v === undefined) {
        v = pointId.size
        pointId.set(k, v)
      }
      return v
    }
    const term = (e: Elem): [number, number] => [pid(e.x1, e.y1), pid(e.x2, e.y2)]
    const terms = new Map<string, [number, number]>()
    for (const e of elems) terms.set(e.id, term(e))

    // --- 2. every distinct point is a node. Wires and closed switches are 0 V sources between
    // their two nodes, so their current comes out of the solve. A wire that closes a loop made only
    // of wires is electrically redundant and would make the matrix singular, so it is dropped.
    const nodeCount = pointId.size
    const nodeOf = new Map<string, [number, number]>()
    for (const e of elems) nodeOf.set(e.id, terms.get(e.id)!)
    const wparent = Array.from({ length: nodeCount }, (_, i) => i)
    const wfind = (a: number): number => (wparent[a] === a ? a : (wparent[a] = wfind(wparent[a])))
    const redundant = new Set<string>()
    for (const e of elems) {
      if (e.type === 'wire' || (e.type === 'switch' && e.closed)) {
        const [a, b] = nodeOf.get(e.id)!
        const ra = wfind(a)
        const rb = wfind(b)
        if (ra === rb) redundant.add(e.id)
        else wparent[ra] = rb
      }
    }

    // --- 3. reference nodes: every ground terminal, plus one node per floating component so the
    // matrix stays non-singular when part of the drawing has no ground.
    const reference = new Set<number>()
    for (const e of elems) if (e.type === 'ground') reference.add(nodeOf.get(e.id)![0])
    const cparent = Array.from({ length: nodeCount }, (_, i) => i)
    const cfind = (a: number): number => (cparent[a] === a ? a : (cparent[a] = cfind(cparent[a])))
    for (const e of elems) {
      if (e.type === 'ground' || (e.type === 'switch' && !e.closed)) continue
      const [a, b] = nodeOf.get(e.id)!
      const ra = cfind(a)
      const rb = cfind(b)
      if (ra !== rb) cparent[ra] = rb
    }
    const compHasRef = new Set<number>()
    for (const r of reference) compHasRef.add(cfind(r))
    for (let i = 0; i < nodeCount; i++) {
      const c = cfind(i)
      if (!compHasRef.has(c)) {
        compHasRef.add(c)
        reference.add(i)
      }
    }
    const unk = new Int32Array(nodeCount).fill(-1)
    let n = 0
    for (let i = 0; i < nodeCount; i++) if (!reference.has(i)) unk[i] = n++
    const nodeUnk = new Map<string, [number, number]>()
    for (const e of elems) {
      const [a, b] = nodeOf.get(e.id)!
      nodeUnk.set(e.id, [unk[a], unk[b]])
    }

    // --- 4. stamps
    const rows: Built['rows'] = []
    let branches = 0
    for (const e of elems) {
      switch (e.type) {
        case 'resistor':
          rows.push({ elem: e, kind: 'g', g: 1 / Math.max(e.value, 1e-9) })
          break
        case 'capacitor':
          rows.push({ elem: e, kind: 'dyn', g: (2 * e.value) / this.dt })
          break
        case 'inductor':
          rows.push({ elem: e, kind: 'dyn', g: this.dt / (2 * Math.max(e.value, 1e-12)) })
          break
        case 'dc':
        case 'ac':
          rows.push({ elem: e, kind: 'src', j: n + branches++ })
          break
        case 'wire':
        case 'switch': {
          const [a, b] = nodeUnk.get(e.id)!
          if ((e.type === 'switch' && !e.closed) || redundant.has(e.id) || (a < 0 && b < 0)) rows.push({ elem: e, kind: 'none' })
          else rows.push({ elem: e, kind: 'src', j: n + branches++ })
          break
        }
        default:
          rows.push({ elem: e, kind: 'none' })
      }
    }
    const N = n + branches
    const A = Array.from({ length: N }, () => new Float64Array(N))
    const rhsBase = new Float64Array(N)
    const stampG = (a: number, b: number, g: number) => {
      if (a >= 0) A[a][a] += g
      if (b >= 0) A[b][b] += g
      if (a >= 0 && b >= 0) {
        A[a][b] -= g
        A[b][a] -= g
      }
    }
    for (const r of rows) {
      const [a, b] = nodeUnk.get(r.elem.id)!
      if (r.kind === 'g' || r.kind === 'dyn') stampG(a, b, r.g!)
      else if (r.kind === 'src') {
        const j = r.j!
        if (a >= 0) {
          A[a][j] += 1
          A[j][a] += 1
        }
        if (b >= 0) {
          A[b][j] -= 1
          A[j][b] -= 1
        }
      }
    }
    let lu: LU | null = null
    this.error = null
    if (N > 0) {
      lu = luFactor(A)
      if (!lu) this.error = 'singular'
    }
    if (this.x.length !== N) this.x = new Float64Array(N)
    return { n: N, lu, rhsBase, nodeOf: nodeUnk, rows, nodeCount }
  }

  /** Advance `steps` time steps. */
  step(steps: number) {
    this.ensureBuilt()
    const B = this.built!
    if (this.error || B.n === 0) {
      this.time += steps * this.dt
      return
    }
    const rhs = new Float64Array(B.n)
    for (let s = 0; s < steps; s++) {
      rhs.fill(0)
      const t = this.time + this.dt
      for (const r of B.rows) {
        const [a, b] = B.nodeOf.get(r.elem.id)!
        if (r.kind === 'dyn') {
          const st = this.states.get(r.elem.id) ?? { v: 0, i: 0 }
          const ieq = r.elem.type === 'capacitor' ? -r.g! * st.v - st.i : st.i + r.g! * st.v
          if (a >= 0) rhs[a] -= ieq
          if (b >= 0) rhs[b] += ieq
        } else if (r.kind === 'src') {
          const e = r.elem
          const v = e.type === 'dc' ? e.value : e.type === 'ac' ? e.value * Math.sin(2 * Math.PI * (e.freq ?? 50) * t) : 0
          rhs[r.j!] = v
        }
      }
      luSolve(B.lu!, rhs, this.x)
      // update dynamic states
      for (const r of B.rows) {
        if (r.kind !== 'dyn') continue
        const [a, b] = B.nodeOf.get(r.elem.id)!
        const v = (a >= 0 ? this.x[a] : 0) - (b >= 0 ? this.x[b] : 0)
        const st = this.states.get(r.elem.id) ?? { v: 0, i: 0 }
        const ieq = r.elem.type === 'capacitor' ? -r.g! * st.v - st.i : st.i + r.g! * st.v
        const i = r.g! * v + ieq
        this.states.set(r.elem.id, { v, i })
      }
      this.time = t
    }
  }

  /** Read the latest solution. */
  read(): SimResult {
    this.ensureBuilt()
    const B = this.built!
    const volts = new Map<string, [number, number]>()
    const amps = new Map<string, number>()
    const x = this.x
    for (const r of B.rows) {
      const [a, b] = B.nodeOf.get(r.elem.id)!
      const v1 = a >= 0 && !this.error ? x[a] : 0
      const v2 = b >= 0 && !this.error ? x[b] : 0
      volts.set(r.elem.id, [v1, v2])
      let i = 0
      if (!this.error) {
        if (r.kind === 'g') i = r.g! * (v1 - v2)
        else if (r.kind === 'dyn') i = this.states.get(r.elem.id)?.i ?? 0
        else if (r.kind === 'src') i = x[r.j!]
      }
      amps.set(r.elem.id, i)
    }
    return { volts, amps, time: this.time, error: this.error }
  }
}

// ---------------- dense LU with partial pivoting ----------------

type LU = { a: Float64Array[]; perm: Int32Array; n: number }

function luFactor(M: Float64Array[]): LU | null {
  const n = M.length
  const a = M.map((r) => Float64Array.from(r))
  const perm = new Int32Array(n)
  for (let i = 0; i < n; i++) perm[i] = i
  for (let k = 0; k < n; k++) {
    let p = k
    let max = Math.abs(a[k][k])
    for (let i = k + 1; i < n; i++) {
      const v = Math.abs(a[i][k])
      if (v > max) {
        max = v
        p = i
      }
    }
    if (max < 1e-14) return null
    if (p !== k) {
      const tmp = a[k]
      a[k] = a[p]
      a[p] = tmp
      const tp = perm[k]
      perm[k] = perm[p]
      perm[p] = tp
    }
    const pivot = a[k][k]
    for (let i = k + 1; i < n; i++) {
      const f = a[i][k] / pivot
      if (f === 0) continue
      a[i][k] = f
      const ri = a[i]
      const rk = a[k]
      for (let j = k + 1; j < n; j++) ri[j] -= f * rk[j]
    }
  }
  return { a, perm, n }
}

function luSolve(lu: LU, b: Float64Array, x: Float64Array) {
  const { a, perm, n } = lu
  // forward
  for (let i = 0; i < n; i++) {
    let s = b[perm[i]]
    const ri = a[i]
    for (let j = 0; j < i; j++) s -= ri[j] * x[j]
    x[i] = s
  }
  // backward
  for (let i = n - 1; i >= 0; i--) {
    let s = x[i]
    const ri = a[i]
    for (let j = i + 1; j < n; j++) s -= ri[j] * x[j]
    x[i] = s / ri[i]
  }
}
