import { Link } from 'react-router-dom'
import { useT } from '../i18n'
import { ResistorSymbol, BatterySymbol, CapacitorSymbol } from '../viz/symbols'
import { CurrentDots } from '../viz/CurrentDots'

function CircuitArt() {
  const loop = 'M 60 30 H 240 V 120 H 60 Z'
  return (
    <svg viewBox="0 0 300 150" className="track-art" aria-hidden="true">
      <path d={loop} fill="none" stroke="var(--text)" strokeWidth={2} />
      <BatterySymbol x={60} y={75} rotate={-90} />
      <ResistorSymbol x={150} y={30} />
      <CapacitorSymbol x={240} y={75} rotate={90} />
      <CurrentDots d={loop} current={1.2} />
    </svg>
  )
}

function SignalArt() {
  // Static epicycle sketch + a partially-converged square wave.
  const terms = [1, 3, 5]
  const pts: string[] = []
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 4
    let y = 0
    for (const n of terms) y += Math.sin(n * t) / n
    pts.push(`${120 + i},${75 - y * 40}`)
  }
  return (
    <svg viewBox="0 0 300 150" className="track-art" aria-hidden="true">
      <circle cx={60} cy={75} r={40} fill="none" stroke="var(--text-muted)" />
      <circle cx={60} cy={35} r={13} fill="none" stroke="var(--text-muted)" />
      <circle cx={73} cy={35} r={8} fill="none" stroke="var(--text-muted)" />
      <line x1={60} y1={75} x2={60} y2={35} stroke="var(--accent)" strokeWidth={2} />
      <line x1={60} y1={35} x2={73} y2={35} stroke="var(--accent)" strokeWidth={2} />
      <line x1={73} y1={35} x2={73} y2={27} stroke="var(--accent)" strokeWidth={2} />
      <line x1={73} y1={27} x2={120} y2={27} stroke="var(--text-muted)" strokeDasharray="3 3" />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--blue)" strokeWidth={2.2} />
    </svg>
  )
}

export function Home() {
  const { t } = useT()
  return (
    <>
      <section className="hero">
        <h1>{t('home.hero.title')}</h1>
        <p className="lead">{t('home.hero.sub')}</p>
      </section>
      <div className="panel-title" style={{ textAlign: 'center' }}>
        {t('home.pick')}
      </div>
      <section className="tracks">
        <Link to="/circuits" className="track">
          <CircuitArt />
          <h2>{t('home.circuits.title')}</h2>
          <p>{t('home.circuits.sub')}</p>
          <span className="cta">{t('home.start')} →</span>
        </Link>
        <Link to="/signals" className="track">
          <SignalArt />
          <h2>{t('home.signals.title')}</h2>
          <p>{t('home.signals.sub')}</p>
          <span className="cta">{t('home.start')} →</span>
        </Link>
      </section>
    </>
  )
}
