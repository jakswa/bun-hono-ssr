import { Hono } from 'hono'
import { deleteCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { createUser, getUserByEmailNormalized } from '../db/queries/users'
import { hashPassword, verifyPassword } from '../utils/password'
import {
  encryptSession,
  sessionExpirationDate,
} from '../utils/private-session'
import { normalizeEmail, readString } from '../utils/validation'

export const authRoutes = new Hono()

function setSessionCookie(
  c: Context,
  user: { id: string; name: string; email: string; created_at: Date },
) {
  const expiresAt = sessionExpirationDate()
  const cookie = encryptSession({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at.toISOString(),
    },
    expiresAt: expiresAt.toISOString(),
  })

  setCookie(c, 'session', cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    expires: expiresAt,
  })
}

authRoutes.get('/register', async (c) => {
  return c.var.render('auth/register', {
    title: 'Register',
    errors: [],
    values: {},
  })
})

authRoutes.post('/register', async (c) => {
  const form = await c.req.formData()
  const name = readString(form, 'name').trim()
  const email = readString(form, 'email').trim()
  const password = readString(form, 'password')
  const emailNormalized = normalizeEmail(email)

  const errors: string[] = []
  if (!name) errors.push('Name is required')
  if (!emailNormalized) errors.push('Email is required')
  if (password.length < 8) errors.push('Password must be at least 8 characters')

  if (errors.length > 0) {
    return c.var.render('auth/register', {
      title: 'Register',
      errors,
      values: { name, email },
    })
  }

  const existingUser = await getUserByEmailNormalized(emailNormalized)
  if (existingUser) {
    return c.var.render('auth/register', {
      title: 'Register',
      errors: ['Email is already registered'],
      values: { name, email },
    })
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({ name, email, emailNormalized, passwordHash })

  setSessionCookie(c, user)
  return c.redirect('/dashboard')
})

authRoutes.get('/login', async (c) => {
  return c.var.render('auth/login', {
    title: 'Login',
    errors: [],
    values: {},
  })
})

authRoutes.post('/login', async (c) => {
  const form = await c.req.formData()
  const email = readString(form, 'email').trim()
  const password = readString(form, 'password')
  const emailNormalized = normalizeEmail(email)

  const user = await getUserByEmailNormalized(emailNormalized)
  const valid = user ? await verifyPassword(password, user.password_hash) : false

  if (!user || !valid) {
    return c.var.render('auth/login', {
      title: 'Login',
      errors: ['Invalid email or password'],
      values: { email },
    })
  }

  setSessionCookie(c, user)
  return c.redirect('/dashboard')
})

authRoutes.post('/logout', async (c) => {
  deleteCookie(c, 'session', { path: '/' })
  return c.redirect('/')
})
