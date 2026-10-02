import { Link } from '../components/L'
import { usePageHead } from '../seo/usePageHead'
import { useT } from '../i18n'
import { ResistorSymbol, BatterySymbol, CapacitorSymbol, InductorSymbol } from '../viz/symbols'
import { CurrentDots } from '../viz/CurrentDots'

function CircuitArt() {
  const loop = 'M 60 30 H 240 V 120 H 60 Z'
  return (
    <svg viewBox="0 0 300 150" className="track-art" aria-hidden="true">
      <path d={loop} fill="none" stroke="var(--lab-stroke)" strokeWidth={2} />
      <BatterySymbol x={60} y={75} rotate={-90} />
      <ResistorSymbol x={120} y={30} />
      <InductorSymbol x={190} y={30} />
      <CapacitorSymbol x={240} y={75} rotate={90} />
      <CurrentDots d={loop} current={1.2} />
    </svg>
  )
}

function SignalArt() {
  const terms = [1, 3, 5, 7]
  const pts: string[] = []
  for (let i = 0; i <= 160; i++) {
    const t = (i / 160) * Math.PI * 4
    let y = 0
    for (const n of terms) y += Math.sin(n * t) / n
    pts.push(`${120 + i},${(75 - y * 40).toFixed(2)}`)
  }
  return (
    <svg viewBox="0 0 300 150" className="track-art" aria-hidden="true">
      <circle cx={60} cy={75} r={40} fill="none" stroke="var(--lab-muted)" />
      <circle cx={60} cy={35} r={13} fill="none" stroke="var(--lab-muted)" />
      <circle cx={73} cy={35} r={8} fill="none" stroke="var(--lab-muted)" />
      <line x1={60} y1={75} x2={60} y2={35} stroke="var(--accent)" strokeWidth={2} />
      <line x1={60} y1={35} x2={73} y2={35} stroke="var(--accent)" strokeWidth={2} />
      <line x1={73} y1={35} x2={73} y2={27} stroke="var(--accent)" strokeWidth={2} />
      <line x1={73} y1={27} x2={120} y2={27} stroke="var(--lab-muted)" strokeDasharray="3 3" />
      <polyline points={pts.join(' ')} fill="none" stroke="var(--lab-pos)" strokeWidth={2.2} />
    </svg>
  )
}

/** Live-looking scope trace for the hero: a damped ring and its envelope. */
function HeroScope() {
  const pts: string[] = []
  const env: string[] = []
  for (let i = 0; i <= 300; i++) {
    const t = i / 300
    const y = Math.exp(-2.2 * t) * Math.sin(2 * Math.PI * 6 * t)
    pts.push(`${i},${(70 - y * 52).toFixed(2)}`)
    env.push(`${i},${(70 - Math.exp(-2.2 * t) * 52).toFixed(2)}`)
  }
  return (
    <div className="hero-scope" aria-hidden="true">
      <span className="tag">CH1 · 2 V/div · 5 ms/div</span>
      <svg viewBox="0 0 300 140">
        <defs>
          <pattern id="hg" width="30" height="28" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 28" fill="none" stroke="var(--lab-grid)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="300" height="140" fill="url(#hg)" />
        <line x1={0} y1={70} x2={300} y2={70} stroke="var(--lab-muted)" strokeWidth={1} />
        <polyline points={env.join(' ')} fill="none" stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 4" opacity={0.7} />
        <polyline points={pts.join(' ')} fill="none" stroke="var(--lab-pos)" strokeWidth={2.2} strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function Home() {
  const { t } = useT()
  usePageHead('/', [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Gnist',
      url: 'https://gnist.tools',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'NOK' },
      inLanguage: ['nb', 'en'],
    },
  ])
  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-kicker">{t('home.kicker')}</div>
          <h1>
            {t('home.hero.a')} <em>{t('home.hero.b')}</em>
          </h1>
          <p className="lead">{t('home.hero.sub')}</p>
        </div>
        <HeroScope />
      </section>
      <section className="tracks" aria-label={t('home.pick')}>
        <Link to="/circuits" className="track">
          <div className="track-head">
            <span>MOD 01 · {t('nav.circuits')}</span>
            <span>
              LIVE <span className="led on" />
            </span>
          </div>
          <CircuitArt />
          <div className="track-body">
            <h2>{t('home.circuits.title')}</h2>
            <p>{t('home.circuits.sub')}</p>
            <span className="cta">{t('home.start')} →</span>
          </div>
        </Link>
        <Link to="/signals" className="track">
          <div className="track-head">
            <span>MOD 02 · {t('nav.signals')}</span>
            <span>
              FFT <span className="led amber" />
            </span>
          </div>
          <SignalArt />
          <div className="track-body">
            <h2>{t('home.signals.title')}</h2>
            <p>{t('home.signals.sub')}</p>
            <span className="cta">{t('home.start.signals')} →</span>
          </div>
        </Link>
      </section>
    </>
  )
}
