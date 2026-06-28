# Bun Hono SSR Starter

A small Bun SSR starter for AI-assisted apps: Hono routes, Eta templates, HTML forms, PostgreSQL, raw SQL migrations, encrypted cookie sessions, and one CSS file.

## Shape

- Run from source with Bun. No app bundling by default.
- Use Hono middleware/routes and Eta SSR templates.
- Use plain HTML forms for UI actions.
- Use `Bun.SQL` with named bun-sqlgen queries in `src/db/queries/*.ts`.
- Use raw SQL migrations in `src/db/migrations/*.sql`.
- Use encrypted private-cookie sessions. There is no session table or per-request session lookup.
- Use `Bun.password` for password hashing.
- Put CSS in `src/styles/app.css` and app-owned assets in `public/assets/`.

## Quick Start

```sh
cp .env.example .env
bun install
bun run db:migrate
bun run dev
```

Open `http://localhost:3000`.

## Env

```env
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"
SESSION_SECRET="change-me-in-production"
ASSET_VERSION="dev"
PORT=3000
NODE_ENV=development
```

Set production `ASSET_VERSION` to a stable release identifier, such as a git SHA.

## Scripts

```sh
bun run dev         # Watch and run src/index.ts
bun run start       # Run src/index.ts
bun run db:migrate  # Apply unapplied SQL migrations
bun run db:types    # Generate bun-sqlgen query result types
bun run typecheck   # TypeScript verification
bun run test        # Test suite using .env.test and --only-failures
bun run build       # Verification: db types, typecheck, tests
```

`build` verifies the app. It does not bundle it.

## Structure

```txt
src/
├── app.ts
├── index.ts
├── assets/serve-assets.ts
├── db/
│   ├── client.ts
│   ├── migrations/001_init.sql
│   └── queries/
├── middleware/
├── routes/
├── styles/app.css
├── utils/
└── views/
```

## Development Rules

- Add pages in `src/routes` and render templates with `c.var.render('template-name', data)`.
- Keep templates simple: display data, avoid business logic, and do not raw-print user input.
- Keep Eta escaping enabled.
- Use semantic CSS classes in `src/styles/app.css`.
- Do not concatenate SQL strings or use `sql.unsafe` with user input.
- After DB changes, run `bun run db:types`, `bun run typecheck`, and `bun run test`.

## Database

- Add schema changes as numbered SQL files in `src/db/migrations`.
- Put app queries in `src/db/queries/*.ts` using `sql.QueryName\`...\``.
- `bun run db:types` validates queries against migrations and refreshes `queries.gen.d.ts`.
- The default tests do not require a migrated external database; they avoid DB-backed routes.
- Runtime registration/login need a real `DATABASE_URL` and `bun run db:migrate`.

## Auth

- Registration stores a user with `Bun.password.hash()`.
- Login verifies with `Bun.password.verify()`.
- The session payload is encrypted into an HTTP-only cookie using `SESSION_SECRET`.
- Protected routes check `c.var.user`; logout clears the cookie.

## Assets

- `/assets/:version/app.css` maps to `src/styles/app.css`.
- Other files map to `public/assets/*`.
- Production responses use long-lived immutable caching.
- Development responses use `no-store`.

## Docker

```sh
docker build -t my-app .
docker run -p 3000:3000 --env-file .env my-app
```

Set `DATABASE_URL`, `SESSION_SECRET`, and production `ASSET_VERSION` in the runtime environment.
