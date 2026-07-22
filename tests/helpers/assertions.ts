import { expect } from 'bun:test'

export async function expectRejects(input: Promise<unknown>, expectedMessage?: RegExp | string) {
  // Bun's expect(sql`...`).rejects can hang when SQL tests run concurrently.
  // Await directly so the query is consumed exactly once.
  let didReject = false
  let error: unknown

  try {
    await input
  } catch (caught) {
    didReject = true
    error = caught
  }

  expect(didReject).toBe(true)

  if (expectedMessage === undefined) return error

  const message = error instanceof Error ? error.message : String(error)

  if (expectedMessage instanceof RegExp) {
    expect(message).toMatch(expectedMessage)
  } else {
    expect(message).toContain(expectedMessage)
  }

  return error
}
