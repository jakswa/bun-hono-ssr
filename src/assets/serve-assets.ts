import type { Context } from 'hono'

const contentTypes: Record<string, string> = {
  css: 'text/css; charset=utf-8',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'text/javascript; charset=utf-8',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  woff: 'font/woff',
  woff2: 'font/woff2',
}

let cachedCss: string | undefined

function assetCacheHeader() {
  return process.env.NODE_ENV === 'production'
    ? 'public, max-age=31536000, immutable'
    : 'no-store'
}

function safeAssetPath(path: string) {
  const cleaned = path.replace(/^\/+/, '')

  if (!cleaned || cleaned.includes('..') || cleaned.includes('\\')) {
    return null
  }

  return cleaned
}

function contentTypeFor(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return contentTypes[ext] ?? 'application/octet-stream'
}

async function readAppCss() {
  if (process.env.NODE_ENV === 'production' && cachedCss) return cachedCss

  const css = await Bun.file('src/styles/app.css').text()

  if (process.env.NODE_ENV === 'production') {
    cachedCss = css
  }

  return css
}

export async function serveAssets(c: Context) {
  const rawPath = c.req.path.replace(/^\/assets\/[^/]+\//, '')
  const path = safeAssetPath(rawPath)

  if (!path) return c.notFound()

  c.header('Cache-Control', assetCacheHeader())

  if (path === 'app.css') {
    c.header('Content-Type', 'text/css; charset=utf-8')
    return c.body(await readAppCss())
  }

  const file = Bun.file(`public/assets/${path}`)

  if (!(await file.exists())) {
    return c.notFound()
  }

  c.header('Content-Type', contentTypeFor(path))
  return c.body(file.stream())
}
