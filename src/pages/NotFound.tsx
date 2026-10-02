import { Link } from '../components/L'
import { useT } from '../i18n'

export function NotFound() {
  const { t } = useT()
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div className="stamp">404</div>
      <h1>{t('notfound.title')}</h1>
      <p className="muted">{t('notfound.sub')}</p>
      <Link className="btn primary" to="/">
        {t('nav.home')}
      </Link>
    </div>
  )
}
