import { createContext, useContext, useEffect } from 'react'
import type { Lang } from '../i18n/strings'

export const SITE = 'https://gnist.tools'

export type HeadMeta = {
  title: string
  description: string
  /** App path without language prefix, e.g. "/circuits". */
  path: string
  lang: Lang
  /** Extra JSON-LD objects. */
  jsonLd?: object[]
}

type Collector = { meta: HeadMeta | null }
export const HeadContext = createContext<Collector | null>(null)

const OG_IMAGE = `${SITE}/og.png`

export function pageUrl(lang: Lang, path: string) {
  return `${SITE}/${lang}${path === '/' ? '' : path}`
}

export function headTags(m: HeadMeta): string {
  const url = pageUrl(m.lang, m.path)
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Gnist',
      url: SITE,
      inLanguage: ['nb', 'en'],
      description: m.description,
    },
    ...(m.jsonLd ?? []),
  ]
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${url}">`,
    `<link rel="alternate" hreflang="nb" href="${pageUrl('nb', m.path)}">`,
    `<link rel="alternate" hreflang="en" href="${pageUrl('en', m.path)}">`,
    `<link rel="alternate" hreflang="x-default" href="${pageUrl('en', m.path)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Gnist">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:locale" content="${m.lang === 'nb' ? 'nb_NO' : 'en_US'}">`,
    `<meta property="og:locale:alternate" content="${m.lang === 'nb' ? 'en_US' : 'nb_NO'}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.description)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
    `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ')
}

/** Declare the page's head metadata. Collected during prerender, applied to the DOM on the client. */
export function useHead(m: HeadMeta) {
  const ctx = useContext(HeadContext)
  if (ctx && typeof window === 'undefined') ctx.meta = m
  useEffect(() => {
    document.title = m.title
    document.documentElement.lang = m.lang
    const url = pageUrl(m.lang, m.path)
    setMeta('name', 'description', m.description)
    setLink('canonical', url)
    setLink('alternate', pageUrl('nb', m.path), 'nb')
    setLink('alternate', pageUrl('en', m.path), 'en')
    setLink('alternate', pageUrl('en', m.path), 'x-default')
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.description)
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:locale', m.lang === 'nb' ? 'nb_NO' : 'en_US')
    setMeta('name', 'twitter:title', m.title)
    setMeta('name', 'twitter:description', m.description)
  }, [m.title, m.description, m.path, m.lang])
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.content = content
}

function setLink(rel: string, href: string, hreflang?: string) {
  const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`
  let el = document.head.querySelector<HTMLLinkElement>(sel)
  if (!el) {
    el = document.createElement('link')
    el.rel = rel
    if (hreflang) el.hreflang = hreflang
    document.head.appendChild(el)
  }
  el.href = href
}
