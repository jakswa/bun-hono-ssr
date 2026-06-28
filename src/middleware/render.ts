import { Eta } from 'eta'
import { createMiddleware } from 'hono/factory'
import { join } from 'node:path'
import type { CurrentUser, Renderer } from '../app-types'
import { env } from '../utils/env'

const eta = new Eta({
  views: join(process.cwd(), 'src/views'),
  cache: env.NODE_ENV === 'production',
})

export const renderMiddleware = createMiddleware<{
  Variables: {
    render: Renderer
    user: CurrentUser
  }
}>(async (c, next) => {
  c.set('render', async (template, data = {}) => {
    const html = await eta.renderAsync(template, {
      ...data,
      user: c.var.user ?? null,
      assetVersion: env.ASSET_VERSION,
    })

    return c.html(html)
  })

  await next()
})
