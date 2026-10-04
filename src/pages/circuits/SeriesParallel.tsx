import { useState } from 'react'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Num, Op } from '../../components/Formula'
import { Readout } from '../../components/Readout'
import { Intuition, TryThis } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { BatterySymbol, ResistorSymbol } from '../../viz/symbols'
import { CurrentDots } from '../../viz/CurrentDots'
import { si } from '../../lib/format'

type Mode = 'series' | 'parallel'
const COLORS = ['var(--accent)', 'var(--blue)', 'var(--green)']

export function SeriesParallel() {
  const { t, V } = useT()
  usePageHead('/circuits/series-parallel')
  const [mode, setMode] = useState<Mode>('series')
  const [U, setU] = useState(12)
  const [Rs, setRs] = useState([100, 220, 470])

  const setR = (i: number, v: number) => setRs((r) => r.map((x, j) => (j === i ? v : x)))

  const Req = mode === 'series' ? Rs.reduce((a, b) => a + b, 0) : 1 / Rs.reduce((a, b) => a + 1 / b, 0)
  const Itot = U / Req
  const perI = Rs.map((r) => (mode === 'series' ? Itot : U / r))
  const perU = Rs.map((r, i) => perI[i] * r)

  // Normalise dot speeds so the biggest circuit current looks "1.5".
  const scale = 1.5 / Math.max(Itot, 1e-9)

  const seriesLoop = 'M 70 60 H 430 V 220 H 70 Z'
  const branchX = [190, 290, 390]
  const branchLoop = (x: number) => `M 70 220 V 60 H ${x} V 220 Z`

  return (
    <>
      <Breadcrumb items={[{ to: '/circuits/learn', label: t('circuits.title') }, { label: t('circuits.sp.title') }]} />
      <h1>{t('circuits.sp.title')}</h1>
      <p className="lead">{t('sp.lead')}</p>

      <div className="seg" style={{ marginTop: 10 }}>
        <button className={mode === 'series' ? 'active' : ''} onClick={() => setMode('series')}>
          {t('sp.series')}
        </button>
        <button className={mode === 'parallel' ? 'active' : ''} onClick={() => setMode('parallel')}>
          {t('sp.parallel')}
        </button>
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="stack">
          <div className="viz">
            <svg viewBox="0 0 480 280" role="img">
              {mode === 'series' ? (
                <>
                  <path d={seriesLoop} fill="none" stroke="var(--text)" strokeWidth={2.5} strokeLinejoin="round" />
                  <BatterySymbol x={70} y={140} rotate={-90} label={V} />
                  {Rs.map((_, i) => (
                    <ResistorSymbol key={i} x={160 + i * 90} y={60} label={`R${i + 1}`} />
                  ))}
                  <CurrentDots d={seriesLoop} current={Itot * scale} />
                  {Rs.map((_, i) => (
                    <text key={i} x={160 + i * 90} y={92} fontSize={12} textAnchor="middle" fill={COLORS[i]} style={{ fontFamily: 'var(--mono)' }}>
                      {si(perU[i], 'V')}
                    </text>
                  ))}
                </>
              ) : (
                <>
                  <path d="M 70 60 H 390 M 70 220 H 390" fill="none" stroke="var(--text)" strokeWidth={2.5} />
                  <path d="M 70 60 V 220" fill="none" stroke="var(--text)" strokeWidth={2.5} />
                  {branchX.map((x) => (
                    <line key={x} x1={x} y1={60} x2={x} y2={220} stroke="var(--text)" strokeWidth={2.5} />
                  ))}
                  <BatterySymbol x={70} y={140} rotate={-90} label={V} />
                  {branchX.map((x, i) => (
                    <ResistorSymbol key={x} x={x} y={140} rotate={90} label={`R${i + 1}`} />
                  ))}
                  {branchX.map((x, i) => (
                    <CurrentDots key={x} d={branchLoop(x)} current={perI[i] * scale} color={COLORS[i]} />
                  ))}
                  {branchX.map((x, i) => (
                    <text key={x} x={x + 10} y={194} fontSize={12} fill={COLORS[i]} style={{ fontFamily: 'var(--mono)' }}>
                      {si(perI[i], 'A')}
                    </text>
                  ))}
                  {branchX.map((x) => (
                    <g key={'j' + x}>
                      <circle cx={x} cy={60} r={3.5} fill="var(--text)" />
                      <circle cx={x} cy={220} r={3.5} fill="var(--text)" />
                    </g>
                  ))}
                </>
              )}
            </svg>
          </div>

          <div className="card">
            <div className="panel-title">{t('common.formula')}</div>
            {mode === 'series' ? (
              <Formula small>
                <span>
                  R<sub>eq</sub>
                </span>
                <Op>=</Op>
                <span>
                  R<sub>1</sub> + R<sub>2</sub> + R<sub>3</sub>
                </span>
                <Op>=</Op>
                <Num>{si(Req, 'Ω')}</Num>
              </Formula>
            ) : (
              <Formula small>
                <span>
                  1 / R<sub>eq</sub>
                </span>
                <Op>=</Op>
                <span>
                  1/R<sub>1</sub> + 1/R<sub>2</sub> + 1/R<sub>3</sub>
                </span>
                <Op>⇒</Op>
                <span>
                  R<sub>eq</sub>
                </span>
                <Op>=</Op>
                <Num>{si(Req, 'Ω')}</Num>
              </Formula>
            )}
            <Formula small>
              <span>
                I<sub>tot</sub>
              </span>
              <Op>=</Op>
              <span>
                {V} / R<sub>eq</sub>
              </span>
              <Op>=</Op>
              <Num>{si(Itot, 'A')}</Num>
            </Formula>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="stack">
              <Slider label={t('q.voltage')} symbol={V} value={U} min={1} max={24} step={0.5} onChange={setU} format={(v) => si(v, 'V')} />
              {Rs.map((r, i) => (
                <Slider
                  key={i}
                  label={`R${i + 1}`}
                  symbol={`R${i + 1}`}
                  value={r}
                  min={10}
                  max={10000}
                  log
                  onChange={(v) => setR(i, v)}
                  format={(v) => si(v, 'Ω')}
                />
              ))}
            </div>
          </div>
          <div className="readouts">
            <Readout label={t('sp.total')} symbol="Req" value={si(Req, 'Ω')} />
            <Readout label={t('sp.totalCurrent')} symbol="I" value={si(Itot, 'A')} />
          </div>
          <div className="card tight">
            <div className="panel-title">{t('sp.perResistor')}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--mono)', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '4px 6px' }}></th>
                  <th style={{ padding: '4px 6px' }}>R</th>
                  <th style={{ padding: '4px 6px' }}>{V}</th>
                  <th style={{ padding: '4px 6px' }}>I</th>
                  <th style={{ padding: '4px 6px' }}>P</th>
                </tr>
              </thead>
              <tbody>
                {Rs.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 6px', color: COLORS[i], fontWeight: 700 }}>R{i + 1}</td>
                    <td style={{ padding: '4px 6px' }}>{si(r, 'Ω')}</td>
                    <td style={{ padding: '4px 6px' }}>{si(perU[i], 'V')}</td>
                    <td style={{ padding: '4px 6px' }}>{si(perI[i], 'A')}</td>
                    <td style={{ padding: '4px 6px' }}>{si(perU[i] * perI[i], 'W')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Intuition text={t('sp.intuition')} />
          <TryThis text={t('sp.try')} />
        </div>
      </div>

      <PageNav prev={{ to: '/circuits/step', key: 'circuits.rc.title' }} next={{ to: '/circuits/components', key: 'circuits.components.title' }} />
    </>
  )
}
