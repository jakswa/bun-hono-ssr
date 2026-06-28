import { join } from 'node:path'

const runtimeRoot = process.env['NODE_ENV'] === 'production' ? 'build' : '.'

export const paths = {
  appAssets: join(runtimeRoot, 'app/assets'),
  dbMigrations: join(runtimeRoot, 'db/migrations'),
  views: join(runtimeRoot, 'app/views'),
}
