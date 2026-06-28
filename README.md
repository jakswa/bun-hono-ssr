# Bun Hono SSR Starter

A small Bun SSR starter for AI-assisted apps: Hono routes, Eta templates, HTML forms, PostgreSQL, raw SQL migrations, encrypted cookie sessions, and one CSS file.

## Shape

- Run from source in development and bundle to `build/` for production.
- Use Hono middleware/routes and Eta SSR templates.
- Use plain HTML forms for UI actions.
- Use `Bun.SQL` with named bun-sqlgen queries in `src/db/queries/*.ts`.
- Use raw SQL migrations in `db/migrations/*.sql`.
- Use encrypted private-cookie sessions. There is no session table or per-request session lookup.
- Use `Bun.password` for password hashing.
- Put templates in `app/views` and CSS/images in `app/assets`.

## Quick Start

```sh
cp .env.example .env.local
bun install
bun run db:migrate
bun run dev
```

Open `http://localhost:3000`.

## Env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/honossr"
SESSION_SECRET="change-me-in-production"
ASSET_VERSION="dev"
PORT=3000
NODE_ENV=development
```

Create the local database named in `DATABASE_URL` before running migrations.
For Docker builds, pass `ASSET_VERSION` as a build arg so asset URLs roll back with the image.

## Scripts

```sh
bun run dev         # Watch and run src/index.ts
bun run start       # Run src/index.ts
bun run start:prod  # Run build/index.js
bun run db:migrate  # Apply unapplied SQL migrations
bun run db:types    # Generate bun-sqlgen query result types
bun run typecheck   # TypeScript verification
bun test            # Concurrent test suite using .env.test
bun run app:build   # Bundle src/index.ts and src/tasks/*.ts into build/
bun run build       # Verification plus app:build
```

Every `src/tasks/*.ts` file becomes a production-runnable `build/tasks/*.js` entrypoint. Task files accept normal CLI args through `Bun.argv`.

## Structure

```txt
app/
├── assets/app.css
└── views/
db/
└── migrations/001_init.sql
src/
├── app.ts
├── index.ts
├── assets/serve-assets.ts
├── db/
│   ├── client.ts
│   └── queries/
├── middleware/
├── routes/
├── tasks/migrate.ts
└── utils/
```

## Development Rules

- Add pages in `src/routes` and render templates with `c.var.render('template-name', data)`.
- Keep templates simple: display data, avoid business logic, and do not raw-print user input.
- Keep Eta escaping enabled.
- Use semantic CSS classes in `app/assets/app.css`.
- Do not concatenate SQL strings or use `sql.unsafe` with user input.
- After DB changes, run `bun run db:types`, `bun run typecheck`, and `bun test`.

## Database

- Add schema changes as numbered SQL files in `db/migrations`.
- Put app queries in `src/db/queries/*.ts` using `sql.QueryName\`...\``.
- `bun run db:types` validates queries against migrations and refreshes `queries.gen.d.ts`.
- `bun test` resets and migrates the `.env.test` database before running tests concurrently.
- Test `DATABASE_URL` must end with `test`; the setup refuses to reset any other database name.
- Tests should create unique data and avoid global row-count assertions.
- Runtime registration/login need a real `DATABASE_URL` and `bun run db:migrate`.

## Auth

- Registration stores a user with `Bun.password.hash()`.
- Login verifies with `Bun.password.verify()`.
- The session payload is encrypted into an HTTP-only cookie using `SESSION_SECRET`.
- Protected routes check `c.var.user`; logout clears the cookie.

## Assets

- `/assets/:version/app.css` maps to `app/assets/app.css`.
- Other files map to `app/assets/*`.
- Production responses use long-lived immutable caching.
- Development responses use `no-store`.

## Production Build

- `scripts/build.ts` bundles `src/index.ts` and every `src/tasks/*.ts` file.
- It copies runtime files from `app/` and `db/migrations/` into `build/`.
- Docker copies only `build/`; it does not need `src/` or `node_modules/` at runtime.

## Docker

```sh
docker build --build-arg ASSET_VERSION=$(git rev-parse --short=7 HEAD) -t my-app .
docker run -p 3000:3000 --env-file .env.production my-app
```

Set `DATABASE_URL` and `SESSION_SECRET` in the runtime environment. Do not override the image's `NODE_ENV=production` unless you mean to disable production caching.
