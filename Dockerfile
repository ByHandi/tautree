# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine

# ---------------------------------------------------------------------------
# base — shared foundation. `libc6-compat` + `openssl` are needed by Prisma
# (and some Next.js native deps) on Alpine.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION} AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---------------------------------------------------------------------------
# deps — install all dependencies. `postinstall` runs `prisma generate`, so
# the schema/config must be present before `npm ci`.
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

# ---------------------------------------------------------------------------
# builder — produce the standalone Next.js server.
# NEXT_PUBLIC_* vars are inlined at build time, so pass the app URL as a build
# arg (override with `--build-arg NEXT_PUBLIC_APP_URL=https://tautree.com`).
# ---------------------------------------------------------------------------
FROM base AS builder
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `lib/generated/prisma` is .dockerignore'd — regenerate it for the build.
RUN npx prisma generate && npm run build

# ---------------------------------------------------------------------------
# runner — production image. Runs `prisma migrate deploy` on startup (via
# entrypoint.sh) and then the standalone Next.js server, as a non-root user.
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Standalone output bundles only the server + traced node_modules.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Migration tooling: the Prisma CLI is a dev dependency and is NOT traced into
# the standalone bundle, so copy the full deps node_modules plus the schema,
# migrations and config that `prisma migrate deploy` reads at startup.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts /app/package.json ./

COPY --chown=nextjs:nodejs entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
