ARG BUN_VERSION=1.3.14
FROM docker.io/oven/bun:${BUN_VERSION}-slim AS base
ARG ASSET_VERSION=dev
WORKDIR /app
ENV NODE_ENV=production
ENV ASSET_VERSION=${ASSET_VERSION}

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --ci

FROM deps AS verify
COPY . .
RUN bun run db:types
RUN bun run typecheck
RUN bun run app:build

FROM base
COPY --from=verify /app/build ./build
EXPOSE 3000
CMD ["bun", "build/index.js"]
