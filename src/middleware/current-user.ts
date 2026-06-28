import { getCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'
import type { CurrentUser } from '../app-types'
import { decryptSession } from '../utils/private-session'

export const currentUser = createMiddleware<{
  Variables: {
    user: CurrentUser
  }
}>(async (c, next) => {
  const cookie = getCookie(c, 'session')

  if (!cookie) {
    c.set('user', null)
    await next()
    return
  }

  const session = decryptSession(cookie)
  c.set(
    'user',
    session
      ? {
          ...session.user,
          created_at: new Date(session.user.created_at),
        }
      : null,
  )

  await next()
})
