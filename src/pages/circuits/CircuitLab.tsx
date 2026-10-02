import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '../../components/L'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'
import type { StringKey } from '../../i18n/strings'
import { Simulator, type SimResult } from '../../sim/engine'
import { EXAMPLES } from '../../sim/examples'
import { RANGE, UNIT, type Elem, type ElemType } from '../../sim/types'
import { Board, type Tool } from '../../viz/lab/Board'
import { Scope, newBuffer, type ScopeBuffer, pushSample } from '../../viz/lab/Scopes'
import { AcSymbol, BatterySymbol, CapacitorSymbol, GroundSymbol, InductorSymbol, ResistorSymbol, SwitchSymbol } from '../../viz/symbols'
import { Slider } from '../../components/Slider'
import { parseSI, si } from '../../lib/format'
import { elemLabel } from '../../viz/lab/draw'

const STORAGE = 'gnist.lab.v1'
const TOOLS: { tool: Tool; key: string }[] = [
  { tool: 'select', key: 'Esc' },
  { tool: 'wire', key: 'W' },
  { tool: 'resistor', key: 'R' },
  { tool: 'capacitor', key: 'C' },
  { tool: 'inductor', key: 'L' },
  { tool: 'dc', key: 'V' },
  { tool: 'ac', key: 'A' },
  { tool: 'switch', key: 'S' },
  { tool: 'ground', key: 'G' },
]
const KEYMAP: Record<string, Tool> = { w: 'wire', r: 'resistor', c: 'capacitor', l: 'inductor', v: 'dc', a: 'ac', s: 'switch', g: 'ground' }

function load(): { elems: Elem[]; scopes: string[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE)
    if (raw) {
      const p = JSON.parse(raw)
      if (Array.isArray(p.elems)) return { elems: p.elems, scopes: Array.isArray(p.scopes) ? p.scopes : [] }
    }
  } catch {
    /* ignore */
  }
  return null
}

function ToolIcon({ tool }: { tool: Tool }) {
  const common = { x: 0, y: 0 }
  return (
    <svg viewBox="-32 -18 64 36" width={48} height={27} aria-hidden="true">
      {tool === 'select' && <path d="M -6 -11 L 8 1 L 1 2 L 5 10 L 2 11 L -2 3 L -6 7 Z" fill="var(--text)" />}
      {tool === 'wire' && <line x1={-28} y1={0} x2={28} y2={0} stroke="var(--text)" strokeWidth={2.4} strokeLinecap="round" />}
      {tool === 'resistor' && <ResistorSymbol {...common} />}
      {tool === 'capacitor' && <CapacitorSymbol {...common} />}
      {tool === 'inductor' && <InductorSymbol {...common} />}
      {tool === 'dc' && <BatterySymbol {...common} />}
      {tool === 'ac' && <AcSymbol {...common} />}
      {tool === 'switch' && <SwitchSymbol {...common} closed={false} />}
      {tool === 'ground' && <GroundSymbol x={0} y={6} />}
    </svg>
  )
}

export function CircuitLab() {
  const { t, V, lang } = useT()
  usePageHead('/circuits')
  const saved = useMemo(load, [])
  const [elems, setElems] = useState<Elem[]>(() => saved?.elems ?? EXAMPLES.lrc())
  const [scopeIds, setScopeIds] = useState<string[]>(() => saved?.scopes ?? [])
  const [tool, setTool] = useState<Tool>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [running, setRunning] = useState(true)
  const [simSpeed, setSimSpeed] = useState(0.05)
  const [currentSpeed, setCurrentSpeed] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [valueText, setValueText] = useState('')
  const [freqText, setFreqText] = useState('')

  const sim = useRef(new Simulator({ elems }))
  const resultRef = useRef<SimResult | null>(null)
  const buffers = useRef(new Map<string, ScopeBuffer>())
  const live = useRef({ elems, running, simSpeed, scopeIds })
  live.current = { elems, running, simSpeed, scopeIds }

  // autosave
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ elems, scopes: scopeIds }))
    } catch {
      /* ignore */
    }
  }, [elems, scopeIds])

  // drop scopes of deleted elements
  useEffect(() => {
    const ids = new Set(elems.map((e) => e.id))
    if (scopeIds.some((id) => !ids.has(id))) setScopeIds(scopeIds.filter((id) => ids.has(id)))
  }, [elems, scopeIds])

  // simulation loop
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const loop = (now: number) => {
      const real = Math.max(0, Math.min(0.05, (now - last) / 1000))
      last = now
      const s = sim.current
      const { elems, running, simSpeed, scopeIds } = live.current
      s.setCircuit({ elems })
      if (running) {
        const simPerFrame = simSpeed * real
        const dt = Math.max(1e-6, Math.min(5e-5, simPerFrame / 200))
        s.setDt(dt)
        const steps = Math.max(1, Math.round(simPerFrame / dt))
        const chunks = 4
        for (let c = 0; c < chunks; c++) {
          s.step(Math.max(1, Math.floor(steps / chunks)))
          if (scopeIds.length) {
            const r = s.read()
            for (const id of scopeIds) {
              let b = buffers.current.get(id)
              if (!b) buffers.current.set(id, (b = newBuffer()))
              const [v1, v2] = r.volts.get(id) ?? [0, 0]
              pushSample(b, v1 - v2, r.amps.get(id) ?? 0)
            }
          }
        }
      }
      const r = s.read()
      resultRef.current = r
      setError((prev) => (prev === r.error ? prev : r.error))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // keyboard
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const tgt = ev.target as HTMLElement
      if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'SELECT' || tgt.tagName === 'TEXTAREA')) return
      if (ev.key === 'Escape') setTool('select')
      else if (ev.key === 'Delete' || ev.key === 'Backspace') {
        if (selectedId) {
          setElems((es) => es.filter((e) => e.id !== selectedId))
          setSelectedId(null)
        }
      } else if (ev.key === ' ') {
        ev.preventDefault()
        setRunning((r) => !r)
      } else if (KEYMAP[ev.key.toLowerCase()] && !ev.metaKey && !ev.ctrlKey) setTool(KEYMAP[ev.key.toLowerCase()])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const selected = elems.find((e) => e.id === selectedId) ?? null
  useEffect(() => {
    if (selected) {
      setValueText(si(selected.value, '').trim())
      setFreqText(selected.freq !== undefined ? si(selected.freq, '').trim() : '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, selected?.value, selected?.freq])

  const vmax = useMemo(() => Math.max(1, ...elems.filter((e) => e.type === 'dc' || e.type === 'ac').map((e) => Math.abs(e.value))), [elems])

  const update = (patch: Partial<Elem>) => selected && setElems((es) => es.map((e) => (e.id === selected.id ? { ...e, ...patch } : e)))
  const commitValue = (txt: string, field: 'value' | 'freq') => {
    const n = parseSI(txt)
    if (isFinite(n) && n > 0) update({ [field]: n })
  }
  const loadExample = (key: string) => {
    const ex = EXAMPLES[key]
    if (!ex) return
    setElems(ex())
    setScopeIds([])
    setSelectedId(null)
    buffers.current.clear()
    sim.current.reset()
  }
  const reset = () => {
    sim.current.reset()
    buffers.current.clear()
  }
  const clearBoard = () => {
    setElems([])
    setScopeIds([])
    setSelectedId(null)
    buffers.current.clear()
    sim.current.reset()
  }
  const toggleScope = (id: string) => {
    setScopeIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= 4 ? ids : [...ids, id]))
  }
  const typeName = (ty: ElemType) => t(`lab.el.${ty}` as const)
  const scopeLabel = (e: Elem) => `${typeName(e.type)} ${elemLabel(e)}`.trim()

  return (
    <div className="lab">
      <div className="lab-toolbar">
        <div className="lab-tools" role="toolbar" aria-label="tools">
          {TOOLS.map(({ tool: tl, key }) => (
            <button key={tl} className={'lab-tool' + (tool === tl ? ' active' : '')} onClick={() => setTool(tl)} title={`${tl === 'select' ? t('lab.tool.select') : typeName(tl)} (${key})`}>
              <ToolIcon tool={tl} />
              <span className="lab-tool-name">{tl === 'select' ? t('lab.tool.select') : typeName(tl)}</span>
              <kbd>{key}</kbd>
            </button>
          ))}
        </div>
        <div className="lab-actions">
          <button className={'btn small' + (running ? ' active' : '')} onClick={() => setRunning(!running)}>
            <span className={'led' + (running ? ' on' : '')} /> {running ? t('lab.running') : t('lab.paused')}
          </button>
          <button className="btn small" onClick={reset} title={t('lab.reset.hint')}>
            ↺ {t('common.reset')}
          </button>
          <select className="lab-select" value="" onChange={(e) => loadExample(e.target.value)} aria-label={t('lab.examples')}>
            <option value="" disabled>
              {t('lab.examples')}…
            </option>
            {Object.keys(EXAMPLES).map((k) => (
              <option key={k} value={k}>
                {t(`lab.ex.${k}` as StringKey)}
              </option>
            ))}
          </select>
          <button className="btn small" onClick={clearBoard}>
            {t('lab.clear')}
          </button>
          <Link className="btn small" to="/circuits/learn">
            {t('lab.learn')} →
          </Link>
        </div>
      </div>

      <div className="lab-main">
        <div className="lab-board-wrap">
          <Board
            elems={elems}
            onChange={setElems}
            tool={tool}
            selectedId={selectedId}
            onSelect={setSelectedId}
            resultRef={resultRef}
            vmax={vmax}
            currentSpeed={currentSpeed}
            iec={lang === 'nb'}
          />
          {error && <div className="lab-error">⚠ {t('lab.error.singular')}</div>}
          {elems.length === 0 && <div className="lab-empty">{t('lab.empty')}</div>}
        </div>

        <aside className="lab-side">
          <div className="lab-panel">
            <div className="panel-title">{t('lab.sim')}</div>
            <Slider label={t('lab.simSpeed')} value={simSpeed} min={0.001} max={2} log onChange={setSimSpeed} format={(v) => `${v >= 1 ? v.toFixed(1) : v.toFixed(3)}×`} />
            <Slider label={t('lab.currentSpeed')} value={currentSpeed} min={0.1} max={5} log onChange={setCurrentSpeed} format={(v) => `${v.toFixed(1)}×`} />
          </div>

          <div className="lab-panel">
            <div className="panel-title">{selected ? typeName(selected.type) : t('lab.selected')}</div>
            {!selected && <p className="muted small-text">{t('lab.hint')}</p>}
            {selected && (
              <div className="stack" style={{ gap: 12 }}>
                {RANGE[selected.type] && (
                  <>
                    <Slider
                      label={t('lab.value')}
                      value={selected.value}
                      min={RANGE[selected.type]![0]}
                      max={RANGE[selected.type]![1]}
                      log
                      onChange={(v) => update({ value: v })}
                      format={(v) => si(v, UNIT[selected.type])}
                    />
                    <div className="lab-input-row">
                      <input
                        className="lab-input"
                        value={valueText}
                        onChange={(e) => setValueText(e.target.value)}
                        onBlur={() => commitValue(valueText, 'value')}
                        onKeyDown={(e) => e.key === 'Enter' && commitValue(valueText, 'value')}
                        aria-label={t('lab.value')}
                      />
                      <span className="lab-unit">{UNIT[selected.type]}</span>
                    </div>
                  </>
                )}
                {selected.type === 'ac' && (
                  <>
                    <Slider label={t('common.frequency')} value={selected.freq ?? 50} min={0.1} max={10000} log onChange={(v) => update({ freq: v })} format={(v) => si(v, 'Hz')} />
                    <div className="lab-input-row">
                      <input
                        className="lab-input"
                        value={freqText}
                        onChange={(e) => setFreqText(e.target.value)}
                        onBlur={() => commitValue(freqText, 'freq')}
                        onKeyDown={(e) => e.key === 'Enter' && commitValue(freqText, 'freq')}
                        aria-label={t('common.frequency')}
                      />
                      <span className="lab-unit">Hz</span>
                    </div>
                  </>
                )}
                {selected.type === 'switch' && (
                  <button className="btn small" onClick={() => update({ closed: !selected.closed })}>
                    {selected.closed ? t('lab.switch.open') : t('lab.switch.close')}
                  </button>
                )}
                {resultRef.current && selected.type !== 'ground' && <Readings e={selected} resultRef={resultRef} V={V} />}
                <div className="chip-row">
                  {(selected.type === 'dc' || selected.type === 'ac') && (
                    <button className="btn small" onClick={() => update({ x1: selected.x2, y1: selected.y2, x2: selected.x1, y2: selected.y1 })}>
                      ⇄ {t('lab.flip')}
                    </button>
                  )}
                  {selected.type !== 'ground' && (
                    <button className={'btn small' + (scopeIds.includes(selected.id) ? ' active' : '')} onClick={() => toggleScope(selected.id)}>
                      {scopeIds.includes(selected.id) ? t('lab.scope.remove') : t('lab.scope.add')}
                    </button>
                  )}
                  <button
                    className="btn small"
                    onClick={() => {
                      setElems((es) => es.filter((e) => e.id !== selected.id))
                      setSelectedId(null)
                    }}
                  >
                    ✕ {t('lab.delete')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lab-panel lab-legend">
            <div className="panel-title">{t('lab.legend')}</div>
            <div>
              <span className="sw" style={{ background: 'var(--lab-pos)' }} /> {t('lab.legend.pos')}
            </div>
            <div>
              <span className="sw" style={{ background: 'var(--lab-neg)' }} /> {t('lab.legend.neg')}
            </div>
            <div>
              <span className="sw" style={{ background: 'var(--lab-dot)', borderRadius: '50%' }} /> {t('lab.legend.dots')}
            </div>
          </div>
        </aside>
      </div>

      {scopeIds.length > 0 && (
        <div className="lab-scopes">
          {scopeIds.map((id) => {
            const e = elems.find((x) => x.id === id)
            if (!e) return null
            return (
              <Scope key={id} id={id} label={scopeLabel(e)} buffers={buffers} onRemove={() => toggleScope(id)} vLabel={V} iLabel="I" removeLabel={t('lab.scope.remove')} />
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Live voltage/current readout for the selected element, updated on a timer rather than per frame. */
function Readings({ e, resultRef, V }: { e: Elem; resultRef: React.MutableRefObject<SimResult | null>; V: string }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 120)
    return () => clearInterval(id)
  }, [])
  const r = resultRef.current
  const [v1, v2] = r?.volts.get(e.id) ?? [0, 0]
  const i = r?.amps.get(e.id) ?? 0
  return (
    <div className="lab-readings">
      <span>
        {V} <b>{si(v1 - v2, 'V')}</b>
      </span>
      <span>
        I <b>{si(i, 'A')}</b>
      </span>
      {e.type === 'resistor' && (
        <span>
          P <b>{si(Math.abs((v1 - v2) * i), 'W')}</b>
        </span>
      )}
    </div>
  )
}
