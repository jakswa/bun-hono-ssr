import { SQL } from 'bun'
import { withTypes } from '@ilbertt/bun-sqlgen'
import { env } from '../utils/env'

export const sql = withTypes(new SQL(env.DATABASE_URL))
