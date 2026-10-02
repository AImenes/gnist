import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useT } from '../i18n'

function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const s = localStorage.getItem('gnist.theme')
      if (s === 'dark' || s === 'light') return s
    } catch {
      /* ignore */
    }
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('gnist.theme', theme)
    } catch {
      /* ignore */
    }
  }, [theme])
  return [theme, setTheme] as const
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
  const [theme, setTheme] = useTheme()

  return (
    <div className="site">
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <SparkLogo />
            {t('app.name')}
          </Link>
          <nav className="nav">
            <NavLink to="/circuits">{t('nav.circuits')}</NavLink>
            <NavLink to="/signals">{t('nav.signals')}</NavLink>
          </nav>
          <div className="header-right">
            <div className="seg lang-toggle" role="group" aria-label={t('nav.lang')}>
              <button className={lang === 'nb' ? 'active' : ''} onClick={() => setLang('nb')}>
                NO
              </button>
              <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
            <button
              className="btn icon-btn"
              aria-label="Toggle theme"
              title="Toggle theme"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </button>
          </div>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        {t('footer.note')}
        <div className="muted" style={{ marginTop: 6, fontSize: '0.8rem', fontFamily: 'var(--mono)' }}>
          v{__APP_VERSION__}
        </div>
      </footer>
    </div>
  )
}
