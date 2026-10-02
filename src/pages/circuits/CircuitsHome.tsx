import { Link } from '../../components/L'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'

export function CircuitsHome() {
  const { t } = useT()
  usePageHead('/circuits/learn')
  const topics = [
    { to: '/circuits/ohm', title: t('circuits.ohm.title'), sub: t('circuits.ohm.sub') },
    { to: '/circuits/components', title: t('circuits.components.title'), sub: t('circuits.components.sub') },
    { to: '/circuits/step', title: t('circuits.rc.title'), sub: t('circuits.rc.sub') },
    { to: '/circuits/series-parallel', title: t('circuits.sp.title'), sub: t('circuits.sp.sub') },
  ]
  return (
    <>
      <h1>{t('circuits.title')}</h1>
      <p className="lead">{t('circuits.sub')}</p>
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
