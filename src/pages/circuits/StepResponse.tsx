import { useState } from 'react'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Num, Op } from '../../components/Formula'
import { Readout } from '../../components/Readout'
import { Intuition, TryThis } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { BatterySymbol, CapacitorSymbol, InductorSymbol, ResistorSymbol, SwitchSymbol } from '../../viz/symbols'
import { CurrentDots } from '../../viz/CurrentDots'
import { Plot, sample } from '../../viz/Plot'
import { useAnimationFrame } from '../../lib/useAnimationFrame'
import { si } from '../../lib/format'

type Mode = 'RC' | 'RL'

export function StepResponse() {
  const { t, V } = useT()
  const [mode, setMode] = useState<Mode>('RC')
  const [U, setU] = useState(9)
  const [R, setR] = useState(1000)
  const [C, setC] = useState(100e-6)
  const [L, setL] = useState(0.1)
  const [running, setRunning] = useState(true)
  const [tt, setTt] = useState(0) // time in units of τ, 0..6
  const [speed, setSpeed] = useState(1)

  const tau = mode === 'RC' ? R * C : L / R
  const T_END = 6

  useAnimationFrame((dt) => {
    setTt((v) => {
      const n = v + dt * speed * 0.9
      return n >= T_END ? 0 : n
    })
  }, running)

  const closed = tt > 0.02
  // Normalised curves: the "slow" quantity rises 1-e^-x, the "fast" one decays e^-x
  const rise = (x: number) => 1 - Math.exp(-x)
  const fall = (x: number) => Math.exp(-x)
  const iNow = mode === 'RC' ? (U / R) * fall(tt) : (U / R) * rise(tt)
  const uNow = mode === 'RC' ? U * rise(tt) : U * fall(tt) // u across C or across L
  const iMax = U / R

  const loop = 'M 90 60 H 390 V 220 H 90 Z'
  const dotCurrent = Math.min(5, (iNow / iMax) * 2.5)

  const curveMain = mode === 'RC' ? sample((x) => U * rise(x), 0, T_END, 200) : sample((x) => iMax * rise(x), 0, T_END, 200)
  const curveOther = mode === 'RC' ? sample((x) => iMax * fall(x), 0, T_END, 200) : sample((x) => U * fall(x), 0, T_END, 200)
  // plot both on a 0..1 normalised axis
  const norm = (pts: [number, number][], max: number) => pts.map(([x, y]) => [x, y / max] as [number, number])

  return (
    <>
      <Breadcrumb items={[{ to: '/circuits', label: t('circuits.title') }, { label: t('circuits.rc.title') }]} />
      <h1>{t('circuits.rc.title')}</h1>
      <p className="lead">{t('rc.lead')}</p>

      <div className="toolbar" style={{ marginTop: 10 }}>
        <div className="seg">
          <button className={mode === 'RC' ? 'active' : ''} onClick={() => { setMode('RC'); setTt(0) }}>
            {t('rc.mode.rc')}
          </button>
          <button className={mode === 'RL' ? 'active' : ''} onClick={() => { setMode('RL'); setTt(0) }}>
            {t('rc.mode.rl')}
          </button>
        </div>
        <button className="btn small" onClick={() => setRunning(!running)}>
          {running ? '❚❚ ' + t('common.pause') : '▶ ' + t('common.play')}
        </button>
        <button className="btn small" onClick={() => setTt(0)}>
          ↺ {t('common.reset')}
        </button>
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="stack">
          <div className="viz">
            <svg viewBox="0 0 480 280" role="img">
              <path d={loop} fill="none" stroke="var(--text)" strokeWidth={2.5} strokeLinejoin="round" />
              <BatterySymbol x={90} y={140} rotate={-90} label={V} />
              <SwitchSymbol x={160} y={60} closed={closed} />
              <ResistorSymbol x={280} y={60} label="R" />
              {mode === 'RC' ? <CapacitorSymbol x={390} y={140} rotate={90} label="C" /> : <InductorSymbol x={390} y={140} rotate={90} label="L" />}
              {/* charge level indicator for the capacitor / field for inductor */}
              {mode === 'RC' ? (
                <g>
                  <rect x={404} y={110} width={10} height={60} fill="var(--bg-elev-2)" stroke="var(--border)" rx={3} />
                  <rect x={404} y={110 + 60 * (1 - rise(tt))} width={10} height={60 * rise(tt)} fill="var(--blue)" rx={3} />
                  <text x={409} y={186} fontSize={11} textAnchor="middle" fill="var(--blue)" style={{ fontFamily: 'var(--mono)' }}>
                    {Math.round(rise(tt) * 100)}%
                  </text>
                </g>
              ) : (
                <g opacity={0.2 + 0.8 * rise(tt)}>
                  {[14, 22, 30].map((r) => (
                    <ellipse key={r} cx={390} cy={140} rx={r * 0.6} ry={r} fill="none" stroke="var(--green)" strokeWidth={1.5} />
                  ))}
                </g>
              )}
              <CurrentDots d={loop} current={closed ? dotCurrent : 0} />
              <text x={240} y={250} fontSize={13} textAnchor="middle" fill="var(--text)" style={{ fontFamily: 'var(--mono)' }}>
                t = {si(tt * tau, 's', 2)} = {tt.toFixed(1)} τ
              </text>
            </svg>
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
            {t('rc.switch')}. {t('rc.markers')}
          </p>

          <div className="viz">
            <div style={{ padding: '12px 14px 0' }} className="legend">
              <span style={{ ['--c' as string]: 'var(--blue)' }}>{mode === 'RC' ? `${V.toLowerCase()}C(t)` : 'i(t)'}</span>
              <span style={{ ['--c' as string]: 'var(--accent)' }}>{mode === 'RC' ? 'i(t)' : `${V.toLowerCase()}L(t)`}</span>
            </div>
            <Plot
              series={[
                { pts: norm(curveMain, mode === 'RC' ? U : iMax), color: 'var(--blue)', width: 2.6 },
                { pts: norm(curveOther, mode === 'RC' ? iMax : U), color: 'var(--accent)', width: 2.6 },
              ]}
              xDomain={[0, T_END]}
              yDomain={[0, 1.05]}
              height={260}
              xTicks={[0, 1, 2, 3, 4, 5, 6]}
              yTicks={[0, 0.25, 0.5, 0.75, 1]}
              xFormat={(x) => `${x}τ`}
              yFormat={(y) => `${Math.round(y * 100)}%`}
              xMarkers={[
                { x: 1, label: '1τ · 63%' },
                { x: 5, label: '5τ · 99%' },
              ]}
              yMarkers={[{ y: 0.632 }]}
              cursorX={tt}
            />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="stack">
              <Slider label={t('q.voltage')} symbol={V} value={U} min={1} max={24} step={0.5} onChange={setU} format={(v) => si(v, 'V')} />
              <Slider label={t('q.resistance')} symbol="R" value={R} min={10} max={100000} log onChange={setR} format={(v) => si(v, 'Ω')} />
              {mode === 'RC' ? (
                <Slider label={t('q.capacitance')} symbol="C" value={C} min={1e-6} max={10e-3} log onChange={setC} format={(v) => si(v, 'F')} />
              ) : (
                <Slider label={t('q.inductance')} symbol="L" value={L} min={1e-3} max={10} log onChange={setL} format={(v) => si(v, 'H')} />
              )}
              <Slider label={t('common.speed')} value={speed} min={0.2} max={3} step={0.1} onChange={setSpeed} format={(v) => `${v.toFixed(1)}×`} />
            </div>
          </div>
          <div className="card">
            <div className="panel-title">{t('common.formula')}</div>
            {mode === 'RC' ? (
              <>
                <Formula small>
                  <span>τ</span>
                  <Op>=</Op>
                  <span>R</span>
                  <Op>·</Op>
                  <span>C</span>
                  <Op>=</Op>
                  <Num>{si(tau, 's')}</Num>
                </Formula>
                <Formula small>
                  <span>
                    {V.toLowerCase()}<sub>C</sub>(t)
                  </span>
                  <Op>=</Op>
                  <span>{V}</span>
                  <Op>·</Op>
                  <span>(1 − e<sup>−t/τ</sup>)</span>
                </Formula>
                <Formula small>
                  <span>i(t)</span>
                  <Op>=</Op>
                  <span>({V}/R)</span>
                  <Op>·</Op>
                  <span>e<sup>−t/τ</sup></span>
                </Formula>
              </>
            ) : (
              <>
                <Formula small>
                  <span>τ</span>
                  <Op>=</Op>
                  <span>L</span>
                  <Op>/</Op>
                  <span>R</span>
                  <Op>=</Op>
                  <Num>{si(tau, 's')}</Num>
                </Formula>
                <Formula small>
                  <span>i(t)</span>
                  <Op>=</Op>
                  <span>({V}/R)</span>
                  <Op>·</Op>
                  <span>(1 − e<sup>−t/τ</sup>)</span>
                </Formula>
                <Formula small>
                  <span>
                    {V.toLowerCase()}<sub>L</sub>(t)
                  </span>
                  <Op>=</Op>
                  <span>{V}</span>
                  <Op>·</Op>
                  <span>e<sup>−t/τ</sup></span>
                </Formula>
              </>
            )}
          </div>
          <div className="readouts">
            <Readout label={t('q.timeConstant')} symbol="τ" value={si(tau, 's')} />
            <Readout label={mode === 'RC' ? `${V}C` : `${V}L`} value={si(uNow, 'V')} />
            <Readout label={t('q.current')} symbol="I" value={si(iNow, 'A')} />
          </div>
          <Intuition text={t('rc.intuition')} />
          <TryThis text={t('rc.try')} />
        </div>
      </div>

      <PageNav prev={{ to: '/circuits/components', key: 'circuits.components.title' }} next={{ to: '/circuits/series-parallel', key: 'circuits.sp.title' }} />
    </>
  )
}
