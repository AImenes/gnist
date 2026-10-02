import { useT } from '../i18n'

export function Intuition({ text }: { text: string }) {
  const { t } = useT()
  return (
    <div className="callout">
      <div className="panel-title">{t('common.intuition')}</div>
      <p>{text}</p>
    </div>
  )
}

export function TryThis({ text }: { text: string }) {
  const { t } = useT()
  return (
    <div className="callout blue">
      <div className="panel-title">{t('common.tryThis')}</div>
      <p>{text}</p>
    </div>
  )
}
