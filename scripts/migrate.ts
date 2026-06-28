import { SQL } from 'bun'
import { readdir } from 'node:fs/promises'
import { env } from '../src/utils/env'

const sql = new SQL(env.DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
  )
`

const files = (await readdir('src/db/migrations'))
  .filter((file) => file.endsWith('.sql'))
  .sort()

await sql.begin(async (tx) => {
  await tx`SELECT pg_advisory_xact_lock(92384756)`

  for (const file of files) {
    const [alreadyApplied] = await tx`
      SELECT 1 FROM schema_migrations WHERE filename = ${file}
    `

    if (alreadyApplied) continue

    console.log(`Applying migration: ${file}`)
    await tx.file(`src/db/migrations/${file}`)
    await tx`INSERT INTO schema_migrations (filename) VALUES (${file})`
  }
})

await sql.close()
console.log('Migrations complete')
