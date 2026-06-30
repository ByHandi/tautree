#!/bin/sh
# Container entrypoint: apply pending migrations, then start the server.
# `prisma migrate deploy` is idempotent — it only applies migrations that
# haven't run yet, so it's safe to run on every container start.
set -e

echo "→ Applying database migrations (prisma migrate deploy)..."
node node_modules/prisma/build/index.js migrate deploy

echo "→ Starting Next.js server..."
exec node server.js
