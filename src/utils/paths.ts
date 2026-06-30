import { join } from 'node:path'

// In dev, runtime files live under src/. In prod, the build copies them under build/.
const runtimeRoot = process.env['NODE_ENV'] === 'production' ? 'build' : 'src'

export const paths = {
  appAssets: join(runtimeRoot, 'static'),
  dbMigrations: join(runtimeRoot, 'db/migrations'),
  views: join(runtimeRoot, 'views'),
}
