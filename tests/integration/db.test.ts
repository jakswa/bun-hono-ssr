import { describe, test } from 'bun:test'
import { sql } from '../../src/db/client'
import { expectRejects } from '../helpers/assertions'

describe('database integration', () => {
  test('asserts rejected SQL queries without hanging the concurrent suite', async () => {
    await expectRejects(sql`SELECT * FROM definitely_missing_table`, /definitely_missing_table/)
  })
})
