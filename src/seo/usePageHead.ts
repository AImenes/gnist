import { useT } from '../i18n'
import { PAGE_META } from './pages'
import { useHead } from './head'

/** Apply the SEO copy for an app path in the active language. */
export function usePageHead(path: string, jsonLd?: object[]) {
  const { lang } = useT()
  const m = PAGE_META[path]?.[lang] ?? PAGE_META['/'][lang]
  useHead({ title: m.title, description: m.description, path, lang, jsonLd })
}
