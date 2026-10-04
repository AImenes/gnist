import { Link } from '../../components/L'
import { usePageHead } from '../../seo/usePageHead'
import { useT } from '../../i18n'

export function CircuitsHome() {
  const { t } = useT()
  usePageHead('/circuits/learn')
  const sections = [
    {
      title: t('learn.sec.fund'),
      topics: [
        { to: '/circuits/ohm', title: t('circuits.ohm.title'), sub: t('circuits.ohm.sub') },
        { to: '/circuits/step', title: t('circuits.rc.title'), sub: t('circuits.rc.sub') },
        { to: '/circuits/series-parallel', title: t('circuits.sp.title'), sub: t('circuits.sp.sub') },
      ],
    },
    {
      title: t('learn.sec.comp'),
      topics: [
        { to: '/circuits/components', title: t('circuits.components.title'), sub: t('circuits.components.sub') },
        { to: '/circuits/opamp', title: t('circuits.opamp.title'), sub: t('circuits.opamp.sub') },
      ],
    },
  ]
  return (
    <>
      <h1>{t('circuits.title')}</h1>
      <p className="lead">{t('circuits.sub')}</p>
      {sections.map((sec, si) => (
        <section key={sec.title} style={{ marginTop: si === 0 ? 24 : 32 }}>
          <div className="panel-title">
            {String(si + 1).padStart(2, '0')} · {sec.title}
          </div>
          <div className="topics">
            {sec.topics.map((tp, i) => (
              <Link key={tp.to} to={tp.to} className="topic">
                <div className="num">
                  {String(si + 1).padStart(2, '0')}.{i + 1}
                </div>
                <h3>{tp.title}</h3>
                <p>{tp.sub}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
