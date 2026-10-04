import { useState } from 'react'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Num, Op } from '../../components/Formula'
import { Readout } from '../../components/Readout'
import { Intuition, TryThis } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { GroundSymbol, OpAmpSymbol, ResistorSymbol } from '../../viz/symbols'
import { Plot, sample } from '../../viz/Plot'
import { useAnimationFrame } from '../../lib/useAnimationFrame'
import { si } from '../../lib/format'

type Cfg = 'inverting' | 'noninverting' | 'follower' | 'comparator'
const CFGS: Cfg[] = ['inverting', 'noninverting', 'follower', 'comparator']

export function OpAmp() {
  const { t, V } = useT()
  usePageHead('/circuits/opamp')
  const [cfg, setCfg] = useState<Cfg>('inverting')
  const [Rin, setRin] = useState(1000)
  const [Rf, setRf] = useState(4700)
  const [A, setA] = useState(1)
  const [Vcc, setVcc] = useState(12)
  const [Vref, setVref] = useState(0.5)
  const [running, setRunning] = useState(true)
  const [phase, setPhase] = useState(0)
  useAnimationFrame((dt) => setPhase((p) => (p + dt * 0.15) % 1), running)

  const gain = cfg === 'inverting' ? -Rf / Rin : cfg === 'noninverting' ? 1 + Rf / Rin : cfg === 'follower' ? 1 : Infinity
  const clip = (v: number) => Math.max(-Vcc, Math.min(Vcc, v))
  const vin = (x: number) => A * Math.sin(2 * Math.PI * x)
  const vout = (x: number) => {
    const u = vin(x)
    if (cfg === 'comparator') return u > Vref ? Vcc : -Vcc
    return clip(gain * u)
  }
  const cursor = phase * 2
  const uIn = vin(cursor)
  const uOut = vout(cursor)
  const saturated = cfg !== 'comparator' && Math.abs(gain * uIn) > Vcc
  const peakOut = cfg === 'comparator' ? Vcc : Math.abs(gain) * A
  const clipping = cfg !== 'comparator' && peakOut > Vcc
  const yMax = Vcc * 1.2
  // inverting-input node voltage: the thing feedback holds still
  const vMinus = cfg === 'inverting' ? (saturated ? uIn + ((uOut - uIn) * Rin) / (Rin + Rf) : 0) : cfg === 'comparator' ? Vref : saturated ? (uOut * Rin) / (Rin + Rf) : uIn
  const vPlus = cfg === 'inverting' ? 0 : uIn

  return (
    <>
      <Breadcrumb items={[{ to: '/circuits/learn', label: t('circuits.title') }, { label: t('circuits.opamp.title') }]} />
      <h1>{t('circuits.opamp.title')}</h1>
      <p className="lead">{t('opamp.lead')}</p>

      <div className="card" style={{ marginTop: 6 }}>
        <div className="panel-title">{t('opamp.rules')}</div>
        <ol className="rules">
          <li>{t('opamp.rule1')}</li>
          <li>{t('opamp.rule2')}</li>
        </ol>
      </div>

      <div className="seg" style={{ marginTop: 16 }}>
        {CFGS.map((c) => (
          <button key={c} className={cfg === c ? 'active' : ''} onClick={() => setCfg(c)}>
            {t(`opamp.cfg.${c}` as const)}
          </button>
        ))}
      </div>
      <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.95rem' }}>
        {t(`opamp.cfg.${cfg}.desc` as const)}
      </p>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="stack">
          <div className="viz">
            <Schematic cfg={cfg} Rin={Rin} Rf={Rf} vIn={uIn} vOut={uOut} vMinus={vMinus} vPlus={vPlus} Vref={Vref} V={V} />
          </div>
          <div className="viz">
            <div style={{ padding: '12px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="legend">
                <span style={{ ['--c' as string]: 'var(--text-muted)' }}>
                  {V}
                  <sub>in</sub>
                </span>
                <span style={{ ['--c' as string]: 'var(--accent)' }}>
                  {V}
                  <sub>out</sub>
                </span>
                {cfg === 'comparator' && <span style={{ ['--c' as string]: 'var(--blue)' }}>{V}<sub>ref</sub></span>}
              </div>
              <button className="btn small" onClick={() => setRunning(!running)}>
                {running ? '❚❚ ' + t('common.pause') : '▶ ' + t('common.play')}
              </button>
            </div>
            <Plot
              series={[
                { pts: sample(vin, 0, 2, 300), color: 'var(--text-muted)', width: 2 },
                ...(cfg === 'comparator' ? [{ pts: sample(() => Vref, 0, 2, 2), color: 'var(--blue)', width: 1.5, dash: '4 4' }] : []),
                { pts: sample(vout, 0, 2, 600), color: 'var(--accent)', width: 2.6 },
              ]}
              xDomain={[0, 2]}
              yDomain={[-yMax, yMax]}
              height={280}
              xTicks={[0, 0.5, 1, 1.5, 2]}
              yTicks={[-Vcc, -Vcc / 2, 0, Vcc / 2, Vcc]}
              xFormat={(x) => `${x}T`}
              yFormat={(y) => si(y, 'V', 2)}
              yMarkers={[
                { y: Vcc, label: '+Vcc', color: 'var(--lab-neg)' },
                { y: -Vcc, label: '−Vcc', color: 'var(--lab-neg)' },
              ]}
              cursorX={cursor}
            />
            <div style={{ padding: '0 14px 12px' }} className="readouts">
              <Readout label={`${V}in`} value={si(uIn, 'V', 3)} />
              <Readout label={`${V}out`} value={si(uOut, 'V', 3)} />
              <Readout label={t('opamp.gain')} symbol="A" value={cfg === 'comparator' ? '∞' : `${gain > 0 ? '' : '−'}${Math.abs(gain).toFixed(2)}`} />
              <Readout label={`${V}−`} value={si(vMinus, 'V', 3)} />
            </div>
          </div>
          {clipping && <div className="callout" style={{ borderLeftColor: 'var(--lab-neg)' }}>{t('opamp.clipping', { peak: si(peakOut, 'V', 3), vcc: si(Vcc, 'V', 2) })}</div>}
        </div>

        <div className="stack">
          <div className="card">
            <div className="stack">
              {(cfg === 'inverting' || cfg === 'noninverting') && (
                <>
                  <Slider label={cfg === 'inverting' ? 'R in' : 'R 1'} symbol={cfg === 'inverting' ? 'Rin' : 'R1'} value={Rin} min={100} max={100000} log onChange={setRin} format={(v) => si(v, 'Ω')} />
                  <Slider label="R f" symbol="Rf" value={Rf} min={100} max={1000000} log onChange={setRf} format={(v) => si(v, 'Ω')} />
                </>
              )}
              <Slider label={t('opamp.vin')} symbol={`${V}in`} value={A} min={0.05} max={5} log onChange={setA} format={(v) => si(v, 'V', 2) + ' peak'} />
              {cfg === 'comparator' && <Slider label={t('opamp.vref')} symbol={`${V}ref`} value={Vref} min={-4} max={4} step={0.05} onChange={setVref} format={(v) => si(v, 'V', 2)} />}
              <Slider label={t('opamp.supply')} symbol="Vcc" value={Vcc} min={3} max={18} step={0.5} onChange={setVcc} format={(v) => `±${si(v, 'V', 2)}`} />
            </div>
          </div>
          <div className="card">
            <div className="panel-title">{t('common.formula')}</div>
            {cfg === 'inverting' && (
              <Formula small>
                <span>{V}<sub>out</sub></span>
                <Op>=</Op>
                <span>− (R<sub>f</sub> / R<sub>in</sub>) · {V}<sub>in</sub></span>
                <Op>=</Op>
                <Num>{gain.toFixed(2)} · {V}in</Num>
              </Formula>
            )}
            {cfg === 'noninverting' && (
              <Formula small>
                <span>{V}<sub>out</sub></span>
                <Op>=</Op>
                <span>(1 + R<sub>f</sub> / R<sub>1</sub>) · {V}<sub>in</sub></span>
                <Op>=</Op>
                <Num>{gain.toFixed(2)} · {V}in</Num>
              </Formula>
            )}
            {cfg === 'follower' && (
              <Formula small>
                <span>{V}<sub>out</sub></span>
                <Op>=</Op>
                <span>{V}<sub>in</sub></span>
              </Formula>
            )}
            {cfg === 'comparator' && (
              <Formula small>
                <span>{V}<sub>out</sub></span>
                <Op>=</Op>
                <span>+Vcc</span>
                <span className="muted" style={{ fontFamily: 'var(--font)', fontStyle: 'normal', fontSize: '0.9rem' }}>
                  {t('opamp.if')} {V}<sub>in</sub> &gt; {V}<sub>ref</sub>, {t('opamp.else')} −Vcc
                </span>
              </Formula>
            )}
          </div>
          <Intuition text={t(`opamp.intuition.${cfg}` as const)} />
          <TryThis text={t('opamp.try')} />
        </div>
      </div>

      <PageNav prev={{ to: '/circuits/components', key: 'circuits.components.title' }} />
    </>
  )
}

type SchemProps = { cfg: Cfg; Rin: number; Rf: number; vIn: number; vOut: number; vMinus: number; vPlus: number; Vref: number; V: string }

/** Live schematic of the selected configuration with instantaneous node voltages. */
function Schematic({ cfg, Rin, Rf, vIn, vOut, vMinus, vPlus, Vref, V }: SchemProps) {
  const mono = { fontFamily: 'var(--mono)', fontSize: 12 } as const
  const node = (x: number, y: number, label: string, value: number, anchor: 'start' | 'end' | 'middle' = 'start', dy = -8) => (
    <g>
      <circle cx={x} cy={y} r={3.5} fill="var(--accent)" />
      <text x={x + (anchor === 'start' ? 8 : anchor === 'end' ? -8 : 0)} y={y + dy} textAnchor={anchor} fill="var(--accent)" style={mono}>
        {label} = {si(value, 'V', 3)}
      </text>
    </g>
  )
  // op-amp centred at (260, 150): − input at (230,138), + input at (230,162), output at (294,150)
  const OA = <OpAmpSymbol x={260} y={150} />
  const stroke = 'var(--text)'
  const w = 2.2
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label={cfg}>
      {cfg === 'inverting' && (
        <>
          <line x1={40} y1={138} x2={100} y2={138} stroke={stroke} strokeWidth={w} />
          <ResistorSymbol x={130} y={138} label={`Rin ${si(Rin, 'Ω')}`} />
          <line x1={160} y1={138} x2={230} y2={138} stroke={stroke} strokeWidth={w} />
          {/* feedback */}
          <line x1={190} y1={138} x2={190} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={70} x2={230} y2={70} stroke={stroke} strokeWidth={w} />
          <ResistorSymbol x={260} y={70} label={`Rf ${si(Rf, 'Ω')}`} />
          <line x1={290} y1={70} x2={330} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={330} y1={70} x2={330} y2={150} stroke={stroke} strokeWidth={w} />
          <line x1={294} y1={150} x2={420} y2={150} stroke={stroke} strokeWidth={w} />
          {/* + to ground */}
          <line x1={200} y1={162} x2={230} y2={162} stroke={stroke} strokeWidth={w} />
          <line x1={200} y1={162} x2={200} y2={210} stroke={stroke} strokeWidth={w} />
          <GroundSymbol x={200} y={226} />
          {OA}
          {node(40, 138, `${V}in`, vIn, 'start', 22)}
          <circle cx={190} cy={138} r={3.5} fill="var(--accent)" />
          <text x={182} y={104} textAnchor="end" fill="var(--accent)" style={mono}>
            {V}− = {si(vMinus, 'V', 3)}
          </text>
          {node(420, 150, `${V}out`, vOut, 'end', -10)}
        </>
      )}
      {cfg === 'noninverting' && (
        <>
          <line x1={40} y1={162} x2={230} y2={162} stroke={stroke} strokeWidth={w} />
          {/* R1 from − to ground */}
          <line x1={190} y1={138} x2={230} y2={138} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={138} x2={190} y2={200} stroke={stroke} strokeWidth={w} />
          <ResistorSymbol x={190} y={230} rotate={90} />
          <text x={204} y={234} fill="var(--text)" fontSize={13} fontWeight={600} style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
            R1 {si(Rin, 'Ω')}
          </text>
          <GroundSymbol x={190} y={276} />
          {/* Rf from output to − */}
          <line x1={190} y1={138} x2={190} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={70} x2={230} y2={70} stroke={stroke} strokeWidth={w} />
          <ResistorSymbol x={260} y={70} label={`Rf ${si(Rf, 'Ω')}`} />
          <line x1={290} y1={70} x2={330} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={330} y1={70} x2={330} y2={150} stroke={stroke} strokeWidth={w} />
          <line x1={294} y1={150} x2={420} y2={150} stroke={stroke} strokeWidth={w} />
          {OA}
          {node(40, 162, `${V}in`, vIn, 'start', 20)}
          {node(190, 138, `${V}−`, vMinus, 'end', -10)}
          {node(420, 150, `${V}out`, vOut, 'end', -10)}
        </>
      )}
      {cfg === 'follower' && (
        <>
          <line x1={40} y1={162} x2={230} y2={162} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={138} x2={230} y2={138} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={138} x2={190} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={190} y1={70} x2={330} y2={70} stroke={stroke} strokeWidth={w} />
          <line x1={330} y1={70} x2={330} y2={150} stroke={stroke} strokeWidth={w} />
          <line x1={294} y1={150} x2={420} y2={150} stroke={stroke} strokeWidth={w} />
          {OA}
          {node(40, 162, `${V}in`, vIn, 'start', 20)}
          {node(190, 138, `${V}−`, vMinus, 'end', -10)}
          {node(420, 150, `${V}out`, vOut, 'end', -10)}
        </>
      )}
      {cfg === 'comparator' && (
        <>
          <line x1={40} y1={162} x2={230} y2={162} stroke={stroke} strokeWidth={w} />
          <line x1={40} y1={138} x2={230} y2={138} stroke={stroke} strokeWidth={w} />
          <line x1={294} y1={150} x2={420} y2={150} stroke={stroke} strokeWidth={w} />
          {OA}
          {node(40, 162, `${V}in`, vPlus, 'start', 20)}
          {node(40, 138, `${V}ref`, Vref, 'start', -10)}
          {node(420, 150, `${V}out`, vOut, 'end', -10)}
        </>
      )}
      <text x={260} y={210} textAnchor="middle" fill="var(--text-muted)" style={mono}>
        ±Vcc
      </text>
    </svg>
  )
}
