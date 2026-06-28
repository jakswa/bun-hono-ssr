const nodeEnv = process.env.NODE_ENV ?? 'development'

export const env = {
  DATABASE_URL: mustGet('DATABASE_URL'),
  SESSION_SECRET: mustGet('SESSION_SECRET'),
  PORT: Number(process.env.PORT ?? 3000),
  NODE_ENV: nodeEnv,
  ASSET_VERSION:
    nodeEnv === 'production' ? mustGet('ASSET_VERSION') : String(Date.now()),
}

function mustGet(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}
