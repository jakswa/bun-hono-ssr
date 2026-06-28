import { describe, expect, test } from 'bun:test'

const { app } = await import('../src/app')
const { encryptSession } = await import('../src/utils/private-session')

describe('app', () => {
  test('home page renders', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    expect(await res.text()).toContain('<!doctype html>')
  })

  test('css asset renders without database lookup', async () => {
    const res = await app.request('/assets/test/app.css')
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/css')
  })

  test('dashboard redirects anonymous users', async () => {
    const res = await app.request('/dashboard')
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toBe('/login')
  })

  test('dashboard accepts encrypted private session cookie', async () => {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 1)
    const cookie = encryptSession({
      expiresAt: expiresAt.toISOString(),
      user: {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Test User',
        email: 'test@example.com',
        created_at: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      },
    })

    const res = await app.request('/dashboard', {
      headers: { Cookie: `session=${cookie}` },
    })

    expect(res.status).toBe(200)
    expect(await res.text()).toContain('Signed in as <strong>Test User</strong>')
  })
})
