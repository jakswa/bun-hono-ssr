ARG BUN_VERSION=1.3.14
FROM oven/bun:${BUN_VERSION}-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --ci

FROM deps AS verify
COPY . .
RUN bun run db:types
RUN bun run typecheck
RUN bun run test

FROM base
COPY --from=deps /app/node_modules ./node_modules
COPY --from=verify /app ./
EXPOSE 3000
CMD ["bun", "src/index.ts"]
