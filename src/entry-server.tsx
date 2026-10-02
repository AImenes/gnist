import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'
import { HeadContext, headTags, type HeadMeta } from './seo/head'
import { ROUTES } from './seo/pages'

export { ROUTES }

/** Render one URL to HTML plus the head tags its page declared. Used by scripts/prerender.mjs. */
export function render(url: string): { html: string; head: string; lang: string } {
  const collector: { meta: HeadMeta | null } = { meta: null }
  const html = renderToString(
    <HeadContext.Provider value={collector}>
      <StaticRouter location={url} future={{ v7_relativeSplatPath: true }}>
        <App />
      </StaticRouter>
    </HeadContext.Provider>,
  )
  const meta = collector.meta
  return { html, head: meta ? headTags(meta) : '', lang: meta?.lang ?? 'en' }
}
