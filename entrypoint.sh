#!/bin/sh
# Container entrypoint: apply pending migrations, then start the server.
# `prisma migrate deploy` is idempotent — it only applies migrations that
# haven't run yet, so it's safe to run on every container start.
set -e

echo "→ Applying database migrations (prisma migrate deploy)..."
node node_modules/prisma/build/index.js migrate deploy

# Ensure the bootstrap admin (ADMIN_EMAIL) exists. The seed is idempotent and a
# no-op when ADMIN_EMAIL is unset; demo data is skipped under NODE_ENV=production.
# Non-fatal: a hiccup here must not block the server.
echo "→ Seeding admin account..."
node node_modules/tsx/dist/cli.mjs prisma/seed.ts || echo "⚠ seed failed (continuing)"

echo "→ Starting Next.js server..."
exec node server.js
