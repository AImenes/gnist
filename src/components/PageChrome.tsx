import { Link } from './L'
import { useT } from '../i18n'
import type { StringKey } from '../i18n/strings'

export function Breadcrumb({ items }: { items: { to?: string; label: string }[] }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((it, i) => (
        <span key={i}>
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length - 1 && <span style={{ marginLeft: 8 }}>›</span>}
        </span>
      ))}
    </nav>
  )
}

export function PageNav({ prev, next }: { prev?: { to: string; key: StringKey }; next?: { to: string; key: StringKey } }) {
  const { t } = useT()
  return (
    <div className="page-nav">
      {prev ? (
        <Link className="btn" to={prev.to}>
          ← {t(prev.key)}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link className="btn primary" to={next.to}>
          {t(next.key)} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  )
}
