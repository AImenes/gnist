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

type Locked = 'U' | 'R' | 'I'

export function OhmsLaw() {
  const { t, V } = useT()
  usePageHead('/circuits/ohm')
  const [locked, setLocked] = useState<Locked>('I')
  const [U, setU] = useState(9)
  const [R, setR] = useState(100)
  const [I, setI] = useState(0.09)

  // Derived values: the locked quantity is always computed from the other two.
  const u = locked === 'U' ? R * I : U
  const r = locked === 'R' ? (I > 0 ? U / I : Infinity) : R
  const i = locked === 'I' ? U / R : I
  const P = u * i

  const loop = 'M 90 60 H 390 V 220 H 90 Z'
  const dotCurrent = Math.min(6, i / 0.4)

  const lockBtn = (k: Locked, label: string) => (
    <button key={k} className={'btn small' + (locked === k ? ' active' : '')} onClick={() => setLocked(k)}>
      {label} {locked === k && <span className="muted">· {t('common.locked')}</span>}
    </button>
  )

  return (
    <>
      <Breadcrumb items={[{ to: '/circuits/learn', label: t('circuits.title') }, { label: t('circuits.ohm.title') }]} />
      <h1>{t('circuits.ohm.title')}</h1>
      <p className="lead">{t('ohm.lead')}</p>

      <div className="two-col" style={{ marginTop: 20 }}>
        <div className="stack">
          <div className="viz">
            <svg viewBox="0 0 480 280" role="img" aria-label="Ohm's law circuit">
              <path d={loop} fill="none" stroke="var(--text)" strokeWidth={2.5} strokeLinejoin="round" />
              <BatterySymbol x={90} y={140} rotate={-90} />
              <ResistorSymbol x={240} y={60} label="R" />
              <CurrentDots d={loop} current={dotCurrent} />
              {/* labels */}
              <text x={40} y={135} fontSize={15} fontWeight={700} textAnchor="middle" fill="var(--accent)" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                {V}
              </text>
              <text x={40} y={156} fontSize={13} textAnchor="middle" fill="var(--text)" style={{ fontFamily: 'var(--mono)' }}>
                {si(u, 'V')}
              </text>
              <text x={240} y={92} fontSize={13} textAnchor="middle" fill="var(--text)" style={{ fontFamily: 'var(--mono)' }}>
                {si(r, 'Ω')}
              </text>
              {/* current arrow on the bottom wire */}
              <g>
                <line x1={300} y1={248} x2={190} y2={248} stroke="var(--accent)" strokeWidth={2} markerEnd="url(#arrow)" />
                <text x={245} y={270} fontSize={14} textAnchor="middle" fill="var(--accent)" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                  I <tspan style={{ fontFamily: 'var(--mono)', fontStyle: 'normal', fontSize: 13 }} fill="var(--text)">
                    {' '}
                    = {si(i, 'A')}
                  </tspan>
                </text>
              </g>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" />
                </marker>
              </defs>
            </svg>
          </div>
          <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
            {t('ohm.dots')}
          </p>

          <div className="card">
            <div className="panel-title">{t('common.formula')}</div>
            <Formula>
              <span>{V}</span>
              <Op>=</Op>
              <span>R</span>
              <Op>·</Op>
              <span>I</span>
              <Op>⇒</Op>
              <Num>{si(u, 'V')}</Num>
              <Op>=</Op>
              <Num>{si(r, 'Ω')}</Num>
              <Op>·</Op>
              <Num>{si(i, 'A')}</Num>
            </Formula>
            <Formula small>
              <span>P</span>
              <Op>=</Op>
              <span>{V}</span>
              <Op>·</Op>
              <span>I</span>
              <Op>=</Op>
              <Num>{si(P, 'W')}</Num>
              <span className="muted" style={{ fontFamily: 'var(--font)', fontStyle: 'normal', fontSize: '0.85rem' }}>
                {' '}
                ({t('ohm.power')})
              </span>
            </Formula>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="panel-title">{t('common.lock')}</div>
            <div className="chip-row" style={{ marginBottom: 16 }}>
              {lockBtn('U', V)}
              {lockBtn('I', 'I')}
              {lockBtn('R', 'R')}
            </div>
            <div className="stack">
              <Slider
                label={t('q.voltage')}
                symbol={V}
                value={u}
                min={0}
                max={24}
                step={0.1}
                disabled={locked === 'U'}
                onChange={setU}
                format={(v) => si(v, 'V')}
              />
              <Slider
                label={t('q.resistance')}
                symbol="R"
                value={isFinite(r) ? r : 1000}
                min={1}
                max={1000}
                log
                disabled={locked === 'R'}
                onChange={setR}
                format={(v) => si(v, 'Ω')}
              />
              <Slider
                label={t('q.current')}
                symbol="I"
                value={Math.min(i, 2)}
                min={0}
                max={2}
                step={0.005}
                disabled={locked === 'I'}
                onChange={setI}
                format={(v) => si(v, 'A')}
              />
            </div>
          </div>
          <div className="readouts">
            <Readout label={t('q.voltage')} symbol={V} value={si(u, 'V')} />
            <Readout label={t('q.current')} symbol="I" value={si(i, 'A')} />
            <Readout label={t('q.resistance')} symbol="R" value={si(r, 'Ω')} />
            <Readout label={t('q.power')} symbol="P" value={si(P, 'W')} />
          </div>
          <Intuition text={t('ohm.intuition')} />
          <TryThis text={t('ohm.try')} />
        </div>
      </div>

      <PageNav next={{ to: '/circuits/step', key: 'circuits.rc.title' }} />
    </>
  )
}
