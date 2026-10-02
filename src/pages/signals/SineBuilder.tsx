import { useMemo, useState } from 'react'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'
import { Slider } from '../../components/Slider'
import { Formula, Op } from '../../components/Formula'
import { Intuition, TryThis } from '../../components/Callouts'
import { Breadcrumb, PageNav } from '../../components/PageChrome'
import { Plot, sample, type Series } from '../../viz/Plot'
import { Spectrum } from '../../viz/Spectrum'

type Sine = { id: number; A: number; f: number; phi: number }

const COLORS = ['var(--accent)', 'var(--blue)', 'var(--green)', 'var(--pink)', 'var(--purple)', '#ffd166', '#06d6a0']
const F_MAX = 20
let nextId = 1
const mk = (A: number, f: number, phi = 0): Sine => ({ id: nextId++, A, f, phi })

const PRESETS: Record<string, () => Sine[]> = {
  single: () => [mk(1, 2)],
  beat: () => [mk(0.6, 9), mk(0.6, 10)],
  square: () => [mk(1, 1), mk(1 / 3, 3), mk(1 / 5, 5), mk(1 / 7, 7), mk(1 / 9, 9)],
  saw: () => [mk(1, 1, 180), mk(1 / 2, 2), mk(1 / 3, 3, 180), mk(1 / 4, 4), mk(1 / 5, 5, 180)],
}

export function SineBuilder() {
  const { t } = useT()
  usePageHead('/signals/builder')
  const [sines, setSines] = useState<Sine[]>(() => [mk(1, 2), mk(0.5, 5)])
  const [showParts, setShowParts] = useState(true)

  const update = (id: number, patch: Partial<Sine>) => setSines((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)))
  const remove = (id: number) => setSines((s) => s.filter((x) => x.id !== id))
  const add = () => {
    if (sines.length >= COLORS.length) return
    const usedF = new Set(sines.map((s) => Math.round(s.f)))
    let f = 1
    while (usedF.has(f) && f < F_MAX) f++
    setSines((s) => [...s, mk(0.5, f)])
  }

  const sumFn = (x: number) => sines.reduce((acc, s) => acc + s.A * Math.sin(2 * Math.PI * s.f * x + (s.phi * Math.PI) / 180), 0)
  const yMax = Math.max(1, sines.reduce((a, s) => a + s.A, 0)) * 1.1

  const series: Series[] = useMemo(() => {
    const out: Series[] = []
    if (showParts)
      sines.forEach((s, i) =>
        out.push({ pts: sample((x) => s.A * Math.sin(2 * Math.PI * s.f * x + (s.phi * Math.PI) / 180), 0, 1, 500), color: COLORS[i], width: 1.4, opacity: 0.55 }),
      )
    out.push({ pts: sample(sumFn, 0, 1, 800), color: 'var(--text)', width: 2.6 })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sines, showParts])

  return (
    <>
      <Breadcrumb items={[{ to: '/signals', label: t('signals.title') }, { label: t('signals.builder.title') }]} />
      <h1>{t('signals.builder.title')}</h1>
      <p className="lead">{t('builder.lead')}</p>

      <div className="toolbar" style={{ marginTop: 10 }}>
        <span className="muted" style={{ fontSize: '0.9rem' }}>
          {t('builder.presets')}:
        </span>
        <button className="btn small" onClick={() => setSines(PRESETS.single())}>
          {t('builder.preset.single')}
        </button>
        <button className="btn small" onClick={() => setSines(PRESETS.beat())}>
          {t('builder.preset.beat')}
        </button>
        <button className="btn small" onClick={() => setSines(PRESETS.square())}>
          {t('builder.preset.square')}
        </button>
        <button className="btn small" onClick={() => setSines(PRESETS.saw())}>
          {t('builder.preset.saw')}
        </button>
        <span style={{ flex: 1 }} />
        <button className={'btn small' + (showParts ? ' active' : '')} onClick={() => setShowParts(!showParts)}>
          {t('builder.showParts')}
        </button>
      </div>

      <div className="two-col" style={{ marginTop: 16 }}>
        <div className="stack">
          <div className="viz">
            <div className="panel-title" style={{ padding: '12px 14px 0' }}>
              {t('common.timeDomain')} · {t('builder.sum')}
            </div>
            <Plot
              series={series}
              xDomain={[0, 1]}
              yDomain={[-yMax, yMax]}
              height={300}
              xTicks={[0, 0.25, 0.5, 0.75, 1]}
              yTicks={[-yMax, -yMax / 2, 0, yMax / 2, yMax]}
              xFormat={(v) => `${v} s`}
              yFormat={(v) => v.toFixed(1)}
              xLabel="t"
              yLabel="x(t)"
            />
          </div>
          <div className="viz">
            <div className="panel-title" style={{ padding: '12px 14px 0' }}>
              {t('common.freqDomain')} · {t('common.amplitude')}
            </div>
            <Spectrum
              bars={sines.map((s, i) => ({ x: s.f, h: s.A, color: COLORS[i], label: s.phi ? `${Math.round(s.phi)}°` : undefined }))}
              xMax={F_MAX + 1}
              hMax={1}
              height={200}
              barWidth={0.5}
              xLabel="f (Hz)"
              yLabel="A"
              xFormat={(v) => `${v}`}
            />
          </div>
          <div className="card">
            <div className="panel-title">{t('common.formula')}</div>
            <Formula small>
              <span>x(t)</span>
              <Op>=</Op>
              <span>
                Σ A<sub>k</sub> · sin(2π f<sub>k</sub> t + φ<sub>k</sub>)
              </span>
            </Formula>
            <div className="muted" style={{ fontFamily: 'var(--mono)', fontSize: '0.85rem', marginTop: 8 }}>
              {sines.map((s, i) => (
                <div key={s.id} style={{ color: COLORS[i] }}>
                  {i === 0 ? '  ' : '+ '}
                  {s.A.toFixed(2)} · sin(2π · {s.f.toFixed(1)} · t{s.phi ? ` + ${Math.round(s.phi)}°` : ''})
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="panel-title" style={{ margin: 0 }}>
                {t('builder.components')}
              </div>
              <button className="btn small primary" onClick={add} disabled={sines.length >= COLORS.length}>
                + {t('builder.add')}
              </button>
            </div>
            {sines.map((s, i) => (
              <div className="sine-row" key={s.id}>
                <div className="swatch" style={{ background: COLORS[i] }} />
                <Slider label="A" value={s.A} min={0} max={1} step={0.01} onChange={(v) => update(s.id, { A: v })} format={(v) => v.toFixed(2)} />
                <Slider label="f" value={s.f} min={0.5} max={F_MAX} step={0.5} onChange={(v) => update(s.id, { f: v })} format={(v) => `${v.toFixed(1)} Hz`} />
                <Slider label="φ" value={s.phi} min={0} max={360} step={5} onChange={(v) => update(s.id, { phi: v })} format={(v) => `${Math.round(v)}°`} />
                <button className="btn small" onClick={() => remove(s.id)} aria-label={t('builder.remove')} title={t('builder.remove')} style={{ marginBottom: 6 }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
          <Intuition text={t('builder.intuition')} />
          <TryThis text={t('builder.try')} />
        </div>
      </div>

      <PageNav prev={{ to: '/signals/fourier', key: 'signals.fourier.title' }} />
    </>
  )
}
