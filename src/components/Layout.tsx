import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from './L'
import { useT } from '../i18n'

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  // Read the real theme after hydration so server and client markup match.
  useEffect(() => {
    const attr = document.documentElement.dataset.theme
    if (attr === 'light' || attr === 'dark') setTheme(attr)
    else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) setTheme('light')
  }, [])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('gnist.theme', next)
    } catch {
      /* ignore */
    }
  }
  return toggle
}

export function SparkLogo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M36 6 L18 36 H31 L27 58 L46 26 H33 Z" fill="var(--accent)" stroke="var(--accent-strong)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useT()
  const toggleTheme = useTheme()

  return (
    <div className="site">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Gnist">
            <SparkLogo />
            <span className="brand-name">{t('app.name')}</span>
            <span className="brand-tag">{t('app.tagline')}</span>
          </Link>
          <nav className="nav" aria-label="main">
            <NavLink to="/circuits" end>
              {t('nav.circuits')}
            </NavLink>
            <NavLink to="/signals">{t('nav.signals')}</NavLink>
            <NavLink to="/circuits/learn">{t('nav.learn')}</NavLink>
          </nav>
          <div className="header-right">
            <div className="seg lang-toggle" role="group" aria-label={t('nav.lang')}>
              <button className={lang === 'nb' ? 'active' : ''} onClick={() => setLang('nb')} aria-pressed={lang === 'nb'}>
                NO
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>
                EN
              </button>
            </div>
            <button className="btn icon-btn theme-btn" aria-label="Toggle light/dark" title="Light / dark" onClick={toggleTheme}>
              <svg className="ic-sun" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
                </g>
              </svg>
              <svg className="ic-moon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-left">
            <SparkLogo /> gnist.tools
          </span>
          <span>{t('footer.note')}</span>
          <span className="footer-right">
            v{__APP_VERSION__} · Oslo
          </span>
        </div>
      </footer>
    </div>
  )
}
