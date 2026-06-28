import { migrate } from '../src/db/migrate'
import { env } from '../src/utils/env'

await migrate(env.DATABASE_URL)
console.log('Migrations complete')
