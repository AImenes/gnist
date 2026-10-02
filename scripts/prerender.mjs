// Prerender every route in both languages into dist/, plus sitemap.xml and robots.txt.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle in dist-ssr/).
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const { render, ROUTES } = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)
const template = readFileSync(join(dist, 'index.html'), 'utf8')
const SITE = 'https://gnist.tools'
const LANGS = ['nb', 'en']

function write(urlPath, html) {
  const dir = join(dist, urlPath)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), html)
}

function page(url) {
  const { html, head, lang } = render(url)
  return template
    .replace('<html lang="nb">', `<html lang="${lang}">`)
    .replace('<!--app-head-->', head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
}

const urls = []
for (const lang of LANGS) {
  for (const route of ROUTES) {
    const url = `/${lang}${route === '/' ? '' : route}`
    write(url, page(url))
    urls.push(url)
  }
}
// root: English home, client-side hop to the visitor's language
writeFileSync(join(dist, 'index.html'), page('/'))

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${ROUTES.map((route) => {
  const p = route === '/' ? '' : route
  return LANGS.map(
    (lang) => `  <url>
    <loc>${SITE}/${lang}${p}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route === '/' ? '1.0' : route === '/circuits' ? '0.9' : '0.7'}</priority>
    <xhtml:link rel="alternate" hreflang="nb" href="${SITE}/nb${p}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE}/en${p}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/en${p}"/>
  </url>`,
  ).join('\n')
}).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`prerendered ${urls.length + 1} pages`)
