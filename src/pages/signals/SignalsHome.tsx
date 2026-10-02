import { Link } from '../../components/L'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'

export function SignalsHome() {
  const { t } = useT()
  usePageHead('/signals')
  const topics = [
    { to: '/signals/fourier', title: t('signals.fourier.title'), sub: t('signals.fourier.sub') },
    { to: '/signals/builder', title: t('signals.builder.title'), sub: t('signals.builder.sub') },
  ]
  return (
    <>
      <h1>{t('signals.title')}</h1>
      <p className="lead">{t('signals.sub')}</p>
      <div className="panel-title" style={{ marginTop: 24 }}>
        {t('common.topics')}
      </div>
      <div className="topics">
        {topics.map((tp, i) => (
          <Link key={tp.to} to={tp.to} className="topic">
            <div className="num">{String(i + 1).padStart(2, '0')}</div>
            <h3>{tp.title}</h3>
            <p>{tp.sub}</p>
          </Link>
        ))}
      </div>
    </>
  )
}
