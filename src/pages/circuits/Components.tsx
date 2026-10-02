import { useState } from 'react'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Op } from '../../components/Formula'
import { Readout } from '../../components/Readout'
import { Intuition } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { CapacitorSymbol, InductorSymbol, ResistorSymbol } from '../../viz/symbols'
import { Plot, sample } from '../../viz/Plot'
import { useAnimationFrame } from '../../lib/useAnimationFrame'
import { si, trim } from '../../lib/format'

type Comp = 'R' | 'C' | 'L'

export function Components() {
  const { t, V } = useT()
  const [comp, setComp] = useState<Comp>('C')
  const [R, setR] = useState(100)
  const [C, setC] = useState(10e-6)
  const [L, setL] = useState(10e-3)
  const [f, setF] = useState(100)
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState(0) // 0..1 across two periods

  useAnimationFrame((dt) => setPhase((p) => (p + dt * 0.18) % 1), running)

  const w = 2 * Math.PI * f
  // Applied signal has unit peak. The "response" is what the component does with it.
  // R: apply current I·sin, get voltage R·I·sin.  C: apply voltage, get current ωC·U·cos.  L: apply current, get voltage ωL·I·cos.
  const cfg = {
    R: {
      appliedLabel: 'I',
      responseLabel: V,
      appliedUnit: 'A',
      responseUnit: 'V',
      gain: R,
      lead: 0,
      color: 'var(--accent)',
    },
    C: {
      appliedLabel: V,
      responseLabel: 'I',
      appliedUnit: 'V',
      responseUnit: 'A',
      gain: w * C,
      lead: Math.PI / 2,
      color: 'var(--blue)',
    },
    L: {
      appliedLabel: 'I',
      responseLabel: V,
      appliedUnit: 'A',
      responseUnit: 'V',
      gain: w * L,
      lead: Math.PI / 2,
      color: 'var(--green)',
    },
  }[comp]

  const applied = (x: number) => Math.sin(2 * Math.PI * x) // x in periods
  const response = (x: number) => Math.sin(2 * Math.PI * x + cfg.lead)
  const cursor = phase * 2
  const aNow = applied(cursor)
  const rNow = response(cursor)

  const info = {
    R: { name: t('comp.R.name'), unit: t('comp.R.unit'), law: t('comp.R.law'), intuition: t('comp.R.intuition'), viz: t('comp.R.viz') },
    C: { name: t('comp.C.name'), unit: t('comp.C.unit'), law: t('comp.C.law'), intuition: t('comp.C.intuition'), viz: t('comp.C.viz') },
    L: { name: t('comp.L.name'), unit: t('comp.L.unit'), law: t('comp.L.law'), intuition: t('comp.L.intuition'), viz: t('comp.L.viz') },
  }[comp]

  // Impedance curves 1 Hz .. 100 kHz
  const fMin = 1
  const fMax = 1e5
  const zR = sample(() => R, fMin, fMax, 2).map(([x, y]) => [x, y] as [number, number])
  const zC: [number, number][] = []
  const zL: [number, number][] = []
  for (let i = 0; i <= 200; i++) {
    const ff = fMin * Math.pow(fMax / fMin, i / 200)
    zC.push([ff, 1 / (2 * Math.PI * ff * C)])
    zL.push([ff, 2 * Math.PI * ff * L])
  }

  return (
    <>
      <Breadcrumb items={[{ to: '/circuits', label: t('circuits.title') }, { label: t('circuits.components.title') }]} />
      <h1>{t('circuits.components.title')}</h1>
      <p className="lead">{t('comp.lead')}</p>

      <div className="seg" style={{ marginTop: 10 }}>
        {(['R', 'C', 'L'] as Comp[]).map((k) => (
          <button key={k} className={comp === k ? 'active' : ''} onClick={() => setComp(k)}>
            {k} · {{ R: t('comp.R.name'), C: t('comp.C.name'), L: t('comp.L.name') }[k]}
          </button>
        ))}
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="stack">
          <div className="card">
            <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
              <svg viewBox="-40 -30 80 60" width={120} height={90} aria-hidden="true">
                {comp === 'R' && <ResistorSymbol x={0} y={0} label="R" />}
                {comp === 'C' && <CapacitorSymbol x={0} y={0} label="C" />}
                {comp === 'L' && <InductorSymbol x={0} y={0} label="L" />}
              </svg>
              <div>
                <h2 style={{ marginBottom: 2 }}>{info.name}</h2>
                <div className="muted">{info.unit}</div>
                <div style={{ marginTop: 8, fontWeight: 600 }}>{info.law}</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              {comp === 'R' && (
                <Formula>
                  <span>{V.toLowerCase()}(t)</span>
                  <Op>=</Op>
                  <span>R</span>
                  <Op>·</Op>
                  <span>i(t)</span>
                </Formula>
              )}
              {comp === 'C' && (
                <Formula>
                  <span>i(t)</span>
                  <Op>=</Op>
                  <span>C</span>
                  <Op>·</Op>
                  <span>
                    d{V.toLowerCase()}
                    <Op>/</Op>dt
                  </span>
                </Formula>
              )}
              {comp === 'L' && (
                <Formula>
                  <span>{V.toLowerCase()}(t)</span>
                  <Op>=</Op>
                  <span>L</span>
                  <Op>·</Op>
                  <span>
                    di<Op>/</Op>dt
                  </span>
                </Formula>
              )}
            </div>
          </div>

          <div className="viz">
            <div style={{ padding: '12px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="legend">
                <span style={{ ['--c' as string]: 'var(--text-muted)' }}>
                  {cfg.appliedLabel} ({t('comp.wave.applied')})
                </span>
                <span style={{ ['--c' as string]: cfg.color }}>
                  {cfg.responseLabel} ({t('comp.wave.result')})
                </span>
              </div>
              <button className="btn small" onClick={() => setRunning(!running)}>
                {running ? '❚❚ ' + t('common.pause') : '▶ ' + t('common.play')}
              </button>
            </div>
            <Plot
              series={[
                { pts: sample(applied, 0, 2, 240), color: 'var(--text-muted)', width: 2 },
                { pts: sample(response, 0, 2, 240), color: cfg.color, width: 2.6 },
              ]}
              xDomain={[0, 2]}
              yDomain={[-1.25, 1.25]}
              height={260}
              xTicks={[0, 0.5, 1, 1.5, 2]}
              yTicks={[-1, 0, 1]}
              xFormat={(x) => `${x}T`}
              yFormat={(y) => (y === 0 ? '0' : y > 0 ? '+peak' : '−peak')}
              cursorX={cursor}
            />
            <div style={{ padding: '0 14px 12px' }} className="readouts">
              <Readout label={`${cfg.appliedLabel} ${t('comp.wave.applied')}`} value={`${(aNow * 100).toFixed(0)} %`} />
              <Readout label={`${cfg.responseLabel} ${t('comp.wave.result')}`} value={`${(rNow * 100).toFixed(0)} %`} />
              <Readout
                label={`${cfg.responseLabel} peak`}
                value={si(cfg.gain, cfg.responseUnit) + ` / ${cfg.appliedUnit}`}
              />
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
            {info.viz}
          </p>
        </div>

        <div className="stack">
          <div className="card">
            <div className="stack">
              {comp === 'R' && (
                <Slider label={t('q.resistance')} symbol="R" value={R} min={10} max={10000} log onChange={setR} format={(v) => si(v, 'Ω')} />
              )}
              {comp === 'C' && (
                <Slider label={t('q.capacitance')} symbol="C" value={C} min={100e-9} max={100e-6} log onChange={setC} format={(v) => si(v, 'F')} />
              )}
              {comp === 'L' && (
                <Slider label={t('q.inductance')} symbol="L" value={L} min={1e-3} max={1} log onChange={setL} format={(v) => si(v, 'H')} />
              )}
              <Slider label={t('common.frequency')} symbol="f" value={f} min={10} max={10000} log onChange={setF} format={(v) => si(v, 'Hz')} />
            </div>
          </div>
          <Intuition text={info.intuition} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3>{t('comp.imp.title')}</h3>
        <p className="muted">{t('comp.imp.sub')}</p>
        <div className="two-col">
          <div>
            <div className="legend" style={{ marginBottom: 6 }}>
              <span style={{ ['--c' as string]: 'var(--accent)' }}>|Z<sub>R</sub>| = R</span>
              <span style={{ ['--c' as string]: 'var(--blue)' }}>|Z<sub>C</sub>| = 1 / (ωC)</span>
              <span style={{ ['--c' as string]: 'var(--green)' }}>|Z<sub>L</sub>| = ωL</span>
            </div>
            <Plot
              series={[
                { pts: zR, color: 'var(--accent)' },
                { pts: zC, color: 'var(--blue)' },
                { pts: zL, color: 'var(--green)' },
              ]}
              xDomain={[fMin, fMax]}
              yDomain={[0.1, 1e6]}
              logX
              logY
              height={280}
              xTicks={[1, 10, 100, 1e3, 1e4, 1e5]}
              yTicks={[0.1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6]}
              xFormat={(v) => si(v, 'Hz', 2)}
              yFormat={(v) => si(v, 'Ω', 2)}
              xMarkers={[{ x: f, label: 'f', color: 'var(--text-muted)' }]}
            />
            <p className="muted" style={{ fontSize: '0.9rem', marginTop: 6 }}>
              {t('comp.imp.note')}
            </p>
          </div>
          <div className="stack">
            <Slider label={t('q.resistance')} symbol="R" value={R} min={10} max={10000} log onChange={setR} format={(v) => si(v, 'Ω')} />
            <Slider label={t('q.capacitance')} symbol="C" value={C} min={100e-9} max={100e-6} log onChange={setC} format={(v) => si(v, 'F')} />
            <Slider label={t('q.inductance')} symbol="L" value={L} min={1e-3} max={1} log onChange={setL} format={(v) => si(v, 'H')} />
            <div className="readouts">
              <Readout label={`|Z| @ ${trim(f)} Hz`} symbol="R" value={si(R, 'Ω')} />
              <Readout label={`|Z| @ ${trim(f)} Hz`} symbol="C" value={si(1 / (w * C), 'Ω')} />
              <Readout label={`|Z| @ ${trim(f)} Hz`} symbol="L" value={si(w * L, 'Ω')} />
            </div>
          </div>
        </div>
      </div>

      <PageNav prev={{ to: '/circuits/ohm', key: 'circuits.ohm.title' }} next={{ to: '/circuits/step', key: 'circuits.rc.title' }} />
    </>
  )
}
