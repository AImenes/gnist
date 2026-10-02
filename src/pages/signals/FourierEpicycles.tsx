import { useMemo, useState } from 'react'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Op } from '../../components/Formula'
import { Intuition, TryThis } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { Epicycles } from '../../viz/Epicycles'
import { Spectrum } from '../../viz/Spectrum'
import { fourierTerms, type WaveKind } from '../../lib/fourier'

const MAX_TERMS = 30

export function FourierEpicycles() {
  const { t } = useT()
  const [kind, setKind] = useState<WaveKind>('square')
  const [count, setCount] = useState(3)
  const [omega, setOmega] = useState(1.2)
  const [running, setRunning] = useState(true)
  const [showTarget, setShowTarget] = useState(true)
  const [resetKey, setResetKey] = useState(0)

  const terms = useMemo(() => fourierTerms(kind, count), [kind, count])
  const allTerms = useMemo(() => fourierTerms(kind, MAX_TERMS), [kind])
  const maxN = allTerms[Math.min(MAX_TERMS, Math.max(count, 6)) - 1].n

  const kinds: { k: WaveKind; label: string }[] = [
    { k: 'square', label: t('fourier.wave.square') },
    { k: 'sawtooth', label: t('fourier.wave.sawtooth') },
    { k: 'triangle', label: t('fourier.wave.triangle') },
  ]

  return (
    <>
      <Breadcrumb items={[{ to: '/signals', label: t('signals.title') }, { label: t('signals.fourier.title') }]} />
      <h1>{t('signals.fourier.title')}</h1>
      <p className="lead">{t('fourier.lead')}</p>

      <div className="toolbar" style={{ marginTop: 10 }}>
        <div className="seg">
          {kinds.map(({ k, label }) => (
            <button key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
              {label}
            </button>
          ))}
        </div>
        <button className="btn small" onClick={() => setRunning(!running)}>
          {running ? '❚❚ ' + t('common.pause') : '▶ ' + t('common.play')}
        </button>
        <button className="btn small" onClick={() => setResetKey((k) => k + 1)}>
          ↺ {t('common.reset')}
        </button>
        <button className={'btn small' + (showTarget ? ' active' : '')} onClick={() => setShowTarget(!showTarget)}>
          {t('fourier.target')}
        </button>
      </div>

      <div className="viz" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px 0' }} className="legend">
          <span style={{ ['--c' as string]: 'var(--accent)' }}>{t('fourier.circles')}</span>
          <span style={{ ['--c' as string]: 'var(--blue)' }}>{t('fourier.trace')}</span>
        </div>
        <Epicycles terms={terms} kind={kind} omega={omega} running={running} showTarget={showTarget} resetKey={resetKey} />
      </div>

      <div className="two-col" style={{ marginTop: 18 }}>
        <div className="stack">
          <div className="card">
            <div className="controls">
              <Slider label={t('fourier.terms')} symbol="N" value={count} min={1} max={MAX_TERMS} step={1} onChange={(v) => setCount(Math.round(v))} format={(v) => String(Math.round(v))} />
              <Slider label={t('common.speed')} symbol="ω" value={omega} min={0.2} max={4} step={0.1} onChange={setOmega} format={(v) => `${v.toFixed(1)} rad/s`} />
            </div>
          </div>
          <div className="viz">
            <div className="panel-title" style={{ padding: '12px 14px 0' }}>
              {t('fourier.spectrum')}
            </div>
            <Spectrum
              bars={allTerms
                .filter((tm) => tm.n <= maxN)
                .map((tm) => ({ x: tm.n, h: Math.abs(tm.a), active: tm.n <= (terms[terms.length - 1]?.n ?? 0), label: tm.a < 0 ? '−' : undefined }))}
              xMax={maxN + 1}
              hMax={1.4}
              height={190}
              xLabel={`n (${t('common.harmonic').toLowerCase()})`}
              yLabel={`|A${'ₙ'}|`}
            />
          </div>
          <div className="card">
            <div className="panel-title">{t('fourier.series')}</div>
            <SeriesFormula kind={kind} count={count} />
          </div>
        </div>
        <div className="stack">
          <Intuition text={t('fourier.intuition')} />
          <TryThis text={t('fourier.try')} />
        </div>
      </div>

      <PageNav next={{ to: '/signals/builder', key: 'signals.builder.title' }} />
    </>
  )
}

function SeriesFormula({ kind, count }: { kind: WaveKind; count: number }) {
  const shown = Math.min(count, 4)
  const parts: string[] = []
  for (let k = 0; k < shown; k++) {
    const n = kind === 'sawtooth' ? k + 1 : 2 * k + 1
    const neg = kind === 'sawtooth' ? n % 2 === 0 : kind === 'triangle' ? k % 2 === 1 : false
    const denom = kind === 'triangle' ? n * n : n
    const coef = denom === 1 ? '' : `1/${denom} · `
    parts.push(`${k === 0 ? '' : neg ? ' − ' : ' + '}${coef}sin(${n === 1 ? '' : n}ωt)`)
  }
  const pre = kind === 'square' ? '4/π' : kind === 'sawtooth' ? '2/π' : '8/π²'
  return (
    <Formula small>
      <span>x(t)</span>
      <Op>=</Op>
      <span>{pre}</span>
      <Op>·</Op>
      <span>
        [{parts.join('')}
        {count > shown ? ' + …' : ''}]
      </span>
    </Formula>
  )
}
